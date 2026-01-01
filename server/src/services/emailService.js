const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Transporter configuration - Update with real credentials in .env
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or use host/port
        auth: {
            user: process.env.EMAIL_USER || 'test@example.com',
            pass: process.env.EMAIL_PASS || 'testpassword'
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'TaxSaas'} <${process.env.FROM_EMAIL || 'noreply@taxsaas.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML content
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
