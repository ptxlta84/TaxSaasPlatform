const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook); // Public route

module.exports = router;
