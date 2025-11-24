const axios = require('axios');
const { validatePaymentRequest } = require('../middleware/validatePayment')
const {generateOrderSummary} = require('../commands/dispenseProduct')
const { dispenseMultipleProducts } = require('../commands/sendCommand'); // Adjust if needed
// const tap_secret = process.env.TAP_SECRET
// import tappayments from '@api/tappayments';
const {connectToPOS} = require('../pos/posClient')
const {sendToFrontend} = require ('../webclient');

const machineId = process.env.MACHINEID

const chargeTimestamps = {};

async function runTransaction(amount, roundedAmount, products) {
  const paymentRequest = {
        requestType: 'Payment',
        amount: roundedAmount,
        trackId: 'TRK-' + Date.now()
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
      dispenseMultipleProducts(amount, products, paymentRequest);
      console.log('💳 Payment Approved:', paymentResponse.fullResponse.transRspMsg);
      return { success: true, products };
    } else {
        console.log("payment canceled");
        console.log('❌ Payment Declined:', JSON.stringify(paymentResponse));
      }

    } else {
      console.error('❌ Init Failed:', initResponse);
    }

  } catch (err) {
    let errResponse = err.toString().replace(/\x03/g, '');
    let response = JSON.parse(errResponse);
    console.log(response);
    // console.error('🔥 Error:', err.message);
  }
}


exports.makepayment =  async (req, res) => {
  const { amount, slot, products } = req.body;
  const timestamp = Date.now();
  console.log('📝 Received payment request:', { amount, slot, products },"timestamp : "+ new Date(timestamp).toLocaleString())
  
  // Validate request datas
  const validationErrors = validatePaymentRequest(amount, slot, products);
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:', validationErrors);
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validationErrors
    });
  }

  // Round amount to 3 decimal places for KWD
  const roundedAmount = amount * 1000;
  console.log(roundedAmount);

  try {
    const result = await runTransaction(amount,roundedAmount,products)
    if (result.success) {
      res.status(200).json({ message: "Payment successful", products: result.products });
    } else {
      res.status(402).json({ message: result.error || "Payment failed" });
    }
  } catch (error) {
    console.error('❌ Charge creation failed:');
    // console.error('Full error object:', error);
    // console.error('Error response:', error.response?.data);
    // console.error('Error status:', error.response?.status);
    
    res.status(500).json({ 
      error: error.response?.data || error.message,
      details: 'Check server logs for more information'
    });
  }
};