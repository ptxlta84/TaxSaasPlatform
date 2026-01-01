const express = require('express');
const router = express.Router();
const { calculateAndSaveTax, getMyReturns, uploadForm16 } = require('../controllers/tax.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/calculate', protect, calculateAndSaveTax);
router.get('/my-returns', protect, getMyReturns);
router.post('/upload-form16', protect, upload.single('file'), uploadForm16);

module.exports = router;
