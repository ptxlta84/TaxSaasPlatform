const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const IncomeTaxReturn = require('../models/IncomeTaxReturn');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
    basic: 499,
    professional: 1999,
    business: 4999
};

// @desc    Create Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { plan, itrId } = req.body;
        const amount = PLANS[plan] * 100; // Amount in paise

        if (!amount) return res.status(400).json({ message: 'Invalid Plan' });

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save initial payment record
        const payment = await Payment.create({
            user: req.user._id,
            itr: itrId,
            razorpayOrderId: order.id,
            amount: amount,
            plan: plan,
            status: 'created'
        });

        res.json({
            orderId: order.id,
            amount: amount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentId: payment._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, itrId } = req.body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
             // Payment Success
             // 1. Update Payment Record
             await Payment.findOneAndUpdate(
                 { razorpayOrderId: razorpay_order_id },
                 { 
                     status: 'captured',
                     razorpayPaymentId: razorpay_payment_id,
                     razorpaySignature: razorpay_signature
                 }
             );

             // 2. Update ITR Record
             await IncomeTaxReturn.findByIdAndUpdate(itrId, {
                 paymentStatus: 'paid',
                 paymentPlan: req.body.plan // Pass plan from frontend or retrieve from payment record
             });

             res.json({ status: 'success', message: 'Payment Verified' });
        } else {
            res.status(400).json({ status: 'failure', message: 'Invalid Signature' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle Razorpay Webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest === req.headers['x-razorpay-signature']) {
            const event = req.body.event;
            const payload = req.body.payload.payment.entity;

            console.log('Webhook Event:', event);

            if (event === 'payment.captured') {
                const orderId = payload.order_id;
                
                // Find payment by orderId
                const payment = await Payment.findOne({ razorpayOrderId: orderId });
                
                if (payment) {
                    payment.status = 'captured';
                    payment.razorpayPaymentId = payload.id;
                    await payment.save();

                    // Unlock ITR
                    await IncomeTaxReturn.findByIdAndUpdate(payment.itr, {
                        paymentStatus: 'paid',
                        paymentPlan: payment.plan
                    });
                    console.log(`Payment captured for Order: ${orderId}`);
                }
            } else if (event === 'payment.failed') {
                const orderId = payload.order_id;
                await Payment.findOneAndUpdate(
                    { razorpayOrderId: orderId },
                    { status: 'failed' }
                );
                console.log(`Payment failed for Order: ${orderId}`);
            }

            res.json({ status: 'ok' });
        } else {
            res.status(400).json({ status: 'invalid signature' });
        }

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: error.message });
    }
};
