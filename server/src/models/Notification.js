const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['FILING_ACKNOWLEDGEMENT', 'REFUND_UPDATE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILURE', 'DEADLINE_ALERT', 'PROMOTIONAL', 'GENERAL'],
        required: true
    },
    channels: [{
        type: String,
        enum: ['WHATSAPP', 'SMS', 'EMAIL', 'IN_APP', 'PUSH']
    }],
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: { // Flexible payload for links, amounts, etc.
        type: Map,
        of: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'],
        default: 'PENDING'
    },
    // Tracking individual channel status could be more complex, keeping it simple for now
    deliveryDetails: {
        whatsappId: String,
        emailId: String,
        smsId: String
    },
    readAt: Date
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
