const Notification = require('../models/Notification');
// const emailService = require('./emailService'); // Assuming generic email service exists

// Mock WhatsApp API configurations
// const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
// const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'mock_token';

class NotificationService {
    
    /**
     * Send a notification through multiple channels
     * @param {Object} params - { userId, type, title, message, data, channels }
     */
    async send(params) {
        const { userId, type, title, message, data, channels = ['IN_APP'] } = params;

        // 1. Save to Database (Always, for In-App history)
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            data,
            channels,
            status: 'PENDING'
        });

        const results = {};

        // 2. Dispatch to requested channels
        if (channels.includes('WHATSAPP')) {
            results.whatsapp = await this.sendWhatsApp(userId, type, data);
        }
        
        if (channels.includes('EMAIL')) {
             results.email = await this.sendEmail(userId, title, message, data);
        }

        if (channels.includes('SMS')) {
            results.sms = await this.sendSMS(userId, message);
        }

        // 3. Update Status
        notification.status = 'SENT';
        notification.deliveryDetails = results;
        await notification.save();

        return notification;
    }

    sendWhatsApp(userId, type, data) {
        // Logic: Fetch user mobile number from DB (omitted here for brevity, assume passed or looked up)
        const mobile = "919876543210"; // Data.mobile || User.mobile
        
        console.log(`[WhatsApp] Sending ${type} to ${mobile}`);

        // Template Logic
        if (type === 'FILING_ACKNOWLEDGEMENT') {
            const payload = {
                messaging_product: "whatsapp",
                to: mobile,
                type: "template",
                template: {
                    name: "itr_filing_ack",
                    language: { code: "en_US" },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: data.assessmentYear }, // {{assessment_year}}
                                { type: "text", text: data.ackNumber }, // {{ack_no}}
                                { type: "text", text: data.downloadLink } // {{link}}
                            ]
                        }
                    ]
                }
            };
            console.log(`[WhatsApp] Payload:`, JSON.stringify(payload, null, 2));
            return "mid.mock_whatsapp_id";
        }
        
        // Default text message
        return "mid.mock_text_id";
    }

    sendSMS(userId, message) {
        console.log(`[SMS] Sending to User ${userId}: ${message}`);
        return "sid_mock_sms";
    }

    sendEmail(userId, subject, _message, _data) {
         console.log(`[Email] Sending to User ${userId}: ${subject}`);
         return "eid_mock_email";
    }
}

module.exports = new NotificationService();
