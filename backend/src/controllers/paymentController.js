const axios = require('axios');
const { validatePaymentRequest } = require('../middleware/validatePayment')
const { generateOrderSummary } = require('../commands/dispenseProduct')
const { dispenseMultipleProducts } = require('../commands/sendCommand');
const {
  initializePOS,
  connectToPOS,
  sendPaymentRequest,
  cancelPayment,
  isPaymentApproved,
  getPaymentStatus
} = require('../pos/posClient');

const machineId = process.env.MACHINEID

async function runTransaction(amount, roundedAmount, products, trackId) {
  const paymentRequest = {
    requestType: 'Payment',
    amount: roundedAmount,
    trackId: trackId
  };

  try {
    // Init request
    const initResponse = await connectToPOS({ requestType: 'Init' });

    if (initResponse.responseType === 'StatusResponse') {
      console.log('✅ Initialized:', initResponse.message);
      const paymentResponse = await connectToPOS(paymentRequest);

      // Now evaluate payment response first
      if (
        paymentResponse.responseType === 'PaymentResponse' &&
        paymentResponse.fullResponse.authCode &&
        paymentResponse.fullResponse.authCode !== 'null'
      ) {
        // Payment approved - dispense products
        console.log('💳 Payment Approved:', paymentResponse.fullResponse.transRspMsg);

        // Fire dispense
        dispenseMultipleProducts(amount, products, { trackId });

        return {
          success: true,
          products,
          trackId,
          transactionDetails: paymentResponse.fullResponse
        };
      } else {
        console.log("payment error");
        console.log('❌ Payment Declined:', JSON.stringify(paymentResponse));
        return {
          success: false,
          declined: true,
          message: paymentResponse.fullResponse?.transRspMsg || "Payment Declined",
          transactionDetails: paymentResponse.fullResponse,
          trackId
        };
      }

    } else {
      console.error('❌ Init Failed:', initResponse);
      return { success: false, error: 'Init Failed', details: initResponse };
    }

  } catch (err) {
    let errResponse = err.toString().replace(/\x03/g, '');
    try {
      let response = JSON.parse(errResponse);
      console.log("Parsed error response:", response);
      return { success: false, error: 'Transaction Error', details: response, trackId };
    } catch (e) {
      console.log(errResponse);
      return { success: false, error: 'Transaction Error', details: err.message, trackId };
    }
  }
}

// Main payment endpoint
exports.makepayment = async (req, res) => {
  const { amount, slot, products, trackId: clientTrackId } = req.body;
  const timestamp = Date.now();
  // Use trackId from client if provided, otherwise generate new one
  const trackId = clientTrackId || 'TRK-' + timestamp;

  console.log('📝 Received payment request:', {
    amount,
    slot,
    products,
    trackId,
    clientProvided: !!clientTrackId,
    timestamp: new Date(timestamp).toLocaleString()
  });

  // Validate request data
  const validationErrors = validatePaymentRequest(amount, slot, products);
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:', validationErrors);
    return res.status(400).json({
      error: 'Validation failed',
      details: validationErrors
    });
  }

  // Convert KWD to fils (smallest currency unit)
  const roundedAmount = Math.round(amount * 1000);
  console.log('💰 Amount:', amount, 'KWD =', roundedAmount, 'fils');

  try {
    const result = await runTransaction(amount, roundedAmount, products, trackId);

    if (result.success) {
      return res.status(200).json({
        message: "Payment successful",
        products: result.products,
        trackId: result.trackId,
        transactionDetails: result.transactionDetails
      });
    } else if (result.cancelled) {
      return res.status(400).json({
        message: result.message || "Payment cancelled",
        cancelled: true,
        trackId: result.trackId
      });
    } else if (result.declined) {
      return res.status(402).json({
        message: result.message || "Payment declined",
        declined: true,
        trackId: result.trackId,
        transactionDetails: result.transactionDetails
      });
    } else {
      return res.status(500).json({
        message: result.error || "Payment failed",
        details: result.details,
        trackId: result.trackId
      });
    }
  } catch (error) {
    console.error('❌ Payment processing failed:', error.message);

    return res.status(500).json({
      error: 'Payment processing failed',
      details: error.message
    });
  }
};

// Cancel payment endpoint
exports.cancelPayment = async (req, res) => {
  const { trackId } = req.body;

  console.log('🚫 Cancel payment request received for trackId:', trackId);

  try {
    const result = await cancelPayment(trackId);

    if (result.success) {
      // Transaction cancelled logic (no local state update needed)

      return res.status(200).json({
        message: result.data.message || 'Cancel request submitted',
        success: true,
        trackId
      });
    } else {
      return res.status(500).json({
        message: 'Failed to cancel payment',
        error: result.error,
        trackId
      });
    }
  } catch (error) {
    console.error('❌ Cancel payment failed:', error.message);
    return res.status(500).json({
      error: 'Cancel request failed',
      details: error.message
    });
  }
};