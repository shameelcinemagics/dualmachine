// posClient.js - KNET WiFi/Remote IPOS Integration
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Terminal Configuration
const POS_IP = process.env.POS_IP;
const POS_PORT = 8083;
const CA_CERT = path.join(__dirname, 'ca.pem');

// Store active connections and track IDs
let activeConnection = null;
let currentTrackId = null;
let paymentInProgress = false;

// Helper to connect and send request with timeout and buffering
function connectToPOS(requestObj, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const options = {
      host: POS_IP,
      port: POS_PORT,
      ca: fs.readFileSync(CA_CERT),
      rejectUnauthorized: true
    };

    let responseBuffer = '';
    let isResolved = false;
    let timeoutId = null;

    // Use existing connection for Cancel requests if available
    // BUT only if we are cancelling *active* work.
    // Actually, for robustness, if we are mid-transaction (activeConnection exists),
    // and we want to Cancel, we should use it.
    // For other requests (like another Payment), we shouldn't be here if busy.

    // NOTE: This function is primarily for NEW requests that expect a full cycle.
    // Cancel is special-cased below in its own function, but relies on this 
    // function properly setting `activeConnection`.

    const client = tls.connect(options, () => {
      console.log('🔐 TLS Connection established');
      activeConnection = client; // Store active connection
      client.setKeepAlive(true, 30000); // Ensure connection stays open

      const message = JSON.stringify(requestObj) + String.fromCharCode(0x03);
      client.write(message);
      console.log('📤 Sent request:', requestObj.requestType);

      // Only set timeout after connection is established and message is sent
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          console.warn('⏱️ Request timeout - no response received');
          // Don't destroy immediately if we want to allow manual cancel? 
          // But this is the protocol timeout.
          client.destroy();
          reject(new Error('Request timeout - no response from POS terminal'));
        }
      }, timeout);
    });

    client.on('data', (data) => {
      console.log('📥 Raw POS Data chunk received:', data.length, 'bytes');
      console.log('📥 Raw Chunk content:', data.toString());

      responseBuffer += data.toString();
      console.log('📥 Current Response Buffer Length:', responseBuffer.length);

      // Check if we received complete message (ends with ETX)
      if (responseBuffer.includes('\x03')) {
        console.log('✅ ETX found, processing message...');
        if (timeoutId) clearTimeout(timeoutId);
        isResolved = true;

        const responseStr = responseBuffer.replace(/\x03/g, '');
        console.log('📝 Parsed Response String:', responseStr);

        try {
          const response = JSON.parse(responseStr);
          console.log('📥 Received POS JSON response:', response.responseType);
          resolve(response);
        } catch (err) {
          console.error('❌ JSON Parse Error:', err.message);
          console.error('❌ Failed content:', responseStr);
          reject(new Error('Failed to parse response: ' + err.message));
        } finally {
          // If this was a StatusResponse (like from Cancel), we might keep connection?
          // But usually POS closes or we should close after transaction.
          // For PaymentResponse, transaction is done.
          client.end();
        }
      } else {
        console.log('⏳ Waiting for ETX (End of Text)...');
      }
    });

    client.on('error', (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (!isResolved) {
        isResolved = true;
        console.error('🔥 TLS Error:', err.message);
        reject(err);
      }
    });

    client.on('end', () => {
      if (timeoutId) clearTimeout(timeoutId);
      console.log('🔒 Connection closed');
      activeConnection = null; // Clear active connection
      paymentInProgress = false;

      if (!isResolved) {
        isResolved = true;
        reject(new Error('Connection closed without receiving response'));
      }
    });

    // Handle manual destruction
    client.on('close', () => {
      activeConnection = null;
    });
  });
}

// Initialize connection with POS terminal
async function initializePOS() {
  try {
    const response = await connectToPOS({ requestType: 'Init' });
    if (response.responseType === 'StatusResponse' &&
      (response.message === 'Initialization successful' || response.message === 'ALREADY INIT')) {
      console.log('✅ POS Initialized:', response.message);
      if (response.terminalDetails) {
        console.log('📟 Terminal ID:', response.terminalDetails.terminalId);
        console.log('🏪 Merchant ID:', response.terminalDetails.merchantId);
      }
      return { success: true, data: response };
    }
    return { success: false, error: 'Initialization failed', data: response };
  } catch (error) {
    console.error('❌ Init Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Send payment request
async function sendPaymentRequest(amount, trackId) {
  const paymentRequest = {
    requestType: 'Payment',
    amount: Math.round(amount), // Amount in smallest currency unit (fils)
    trackId: trackId || 'TRK-' + Date.now()
  };

  currentTrackId = paymentRequest.trackId;
  paymentInProgress = true;

  try {
    const response = await connectToPOS(paymentRequest, 180000); // 3 min timeout for payment
    paymentInProgress = false;
    currentTrackId = null;
    return { success: true, data: response, trackId: paymentRequest.trackId };
  } catch (error) {
    paymentInProgress = false;
    currentTrackId = null;
    console.error('❌ Payment Error:', error.message);
    return { success: false, error: error.message, trackId: paymentRequest.trackId };
  }
}

// Cancel ongoing payment
async function cancelPayment(trackId) {
  const cancelRequest = {
    requestType: "Cancel",
    trackId: trackId
  };

  console.log('🚫 Attempting to cancel via:', activeConnection ? 'Existing Connection' : 'New Connection');

  try {
    if (activeConnection && !activeConnection.destroyed) {
      // Send Cancel on existing IO
      const message = JSON.stringify(cancelRequest) + String.fromCharCode(0x03);
      activeConnection.write(message);
      console.log('📤 Sent Cancel request on active connection');

      // We assume the active connection's listener will pick up the result
      // OR the POS will terminate the Payment flow.
      // We return success immediately to the caller so UI can update,
      // while the Payment promise (sendPaymentRequest) will likely resolve/reject shortly.

      return {
        success: true,
        data: { message: 'Cancel signal sent to active socket' }
      };
    }

    // Fallback to new connection if no active connection (e.g. orphan state)
    const response = await connectToPOS(cancelRequest, 60000);
    console.log('🚫 Cancel request sent (new conn):', response.message);
    return { success: true, data: response };

  } catch (error) {
    console.error('❌ Cancel Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Get last transaction details
async function getLastTransaction(trackId) {
  const lastTxnRequest = {
    requestType: 'LastTransaction',
    trackId: trackId || currentTrackId || 'TRK-' + Date.now()
  };

  try {
    const response = await connectToPOS(lastTxnRequest, 30000);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Last Transaction Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Settlement request
async function sendSettlementRequest(trackId) {
  const settlementRequest = {
    requestType: 'Settlement',
    trackId: trackId || 'STL-' + Date.now()
  };

  try {
    const response = await connectToPOS(settlementRequest, 60000);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Settlement Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Clear Key request (for security error resolution)
async function clearKeyRequest(trackId) {
  const clearKeyRequest = {
    requestType: 'ClearKey',
    trackId: trackId || 'CLR-' + Date.now()
  };

  try {
    const response = await connectToPOS(clearKeyRequest, 120000); // 2 min timeout
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Clear Key Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Check payment status helper
function isPaymentApproved(paymentResponse) {
  return (
    paymentResponse?.responseType === 'PaymentResponse' &&
    paymentResponse?.fullResponse?.authCode &&
    paymentResponse?.fullResponse?.authCode !== 'null' &&
    paymentResponse?.fullResponse?.authCode !== null
  );
}

// Get current status
function getPaymentStatus() {
  return {
    inProgress: paymentInProgress,
    currentTrackId: currentTrackId
  };
}

module.exports = {
  connectToPOS,
  initializePOS,
  sendPaymentRequest,
  cancelPayment,
  isPaymentApproved,
  getPaymentStatus
};