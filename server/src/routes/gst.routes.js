const express = require('express');
const router = express.Router();
const { registerGST, getRegistrationStatus, validateGSTIN } = require('../controllers/gst.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', protect, registerGST);
router.get('/status', protect, getRegistrationStatus);
router.post('/validate-gstin', protect, validateGSTIN);

module.exports = router;
