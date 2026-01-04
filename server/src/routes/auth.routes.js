const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, getMe, sendOTP, verifyOTP } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const { check } = require('express-validator');

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    check('mobile', 'Please enter a valid mobile number (10-15 digits)').matches(/^\d{10,15}$/)
], register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);

module.exports = router;
