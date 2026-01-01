const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
