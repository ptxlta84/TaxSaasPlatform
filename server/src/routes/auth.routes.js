const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, getMe, sendOTP, verifyOTP } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);

module.exports = router;
