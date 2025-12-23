const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment routes
router.post('/', paymentController.makepayment);
router.post('/cancel', paymentController.cancelPayment);

module.exports = router;