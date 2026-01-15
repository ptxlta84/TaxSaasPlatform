const Booking = require('../models/Booking');

// @desc    Create new consultation booking
// @route   POST /api/bookings/create
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { 
            caId, 
            caName, 
            consultationType, 
            date, 
            timeSlot, 
            duration, 
            amount, 
            paymentMethod 
        } = req.body;

        // In real app: Verify slot availability and process payment here

        const meetingLink = `https://meet.google.com/abc-${Math.random().toString(36).substr(2, 5)}`;

        const booking = await Booking.create({
            userId: req.user._id,
            caId,
            caName,
            consultationType,
            date,
            timeSlot,
            duration,
            amount,
            paymentMethod,
            meetingLink,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        // Real Notification
        const emailService = require('../services/emailService');
        try {
            await emailService.sendEmail({
                email: req.user.email,
                subject: 'Booking Confirmed',
                message: `Your consultation with ${caName} is confirmed. Link: ${meetingLink}`
            });
             console.info(`[SMS MOCK] Sending SMS to ${req.user.mobile || 'User'}: Booking Confirmed!`);
        } catch (err) {
            console.error("Notification Error:", err);
        }

        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch {
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
};
