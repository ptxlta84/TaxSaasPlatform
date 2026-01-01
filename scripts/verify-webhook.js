const crypto = require('crypto');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SECRET = 'your_webhook_secret'; // In real test, this must match env

// Mock Webhook Payload for Payment Captured
const mockPayload = {
  "entity": "event",
  "account_id": "acc_BFs7FkH505s555",
  "event": "payment.captured",
  "contains": [
    "payment"
  ],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_Des7cnI5j5s555",
        "entity": "payment",
        "amount": 49900,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_Des7cnI5j5s555", // This needs to match a real order in DB or be mocked
        "invoice_id": null,
        "international": false,
        "method": "card",
        "amount_refunded": 0,
        "refund_status": null,
        "captured": true,
        "description": "Subscription for Basic Filing",
        "card_id": "card_Des7cnI5j5s555",
        "bank": null,
        "wallet": null,
        "vpa": null,
        "email": "user@example.com",
        "contact": "+919999999999"
      }
    }
  },
  "created_at": 1567674257
};

async function verifyWebhook() {
    try {
        // 1. Generate Signature
        const signature = crypto.createHmac('sha256', SECRET)
            .update(JSON.stringify(mockPayload))
            .digest('hex');

        console.log('Generated Signature:', signature);

        // 2. Send Request
        const response = await axios.post(`${API_URL}/payments/webhook`, mockPayload, {
            headers: {
                'x-razorpay-signature': signature
            }
        });

        console.log('Webhook Response:', response.data);
    } catch (error) {
        console.error('Webhook Failed:', error.response ? error.response.data : error.message);
    }
}

// Run (Uncomment if you have a running server and want to test)
verifyWebhook();
module.exports = { verifyWebhook };
