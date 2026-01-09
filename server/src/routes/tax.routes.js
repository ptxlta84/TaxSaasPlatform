const express = require('express');
const router = express.Router();
const { calculateAndSaveTax, getMyReturns, uploadForm16, estimateTax, getTaxSummary } = require('../controllers/tax.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/calculate', protect, calculateAndSaveTax);
router.get('/my-returns', protect, getMyReturns);
router.post('/upload-form16', protect, upload.single('file'), uploadForm16);
router.post('/estimate', protect, estimateTax);
router.get('/summary', protect, getTaxSummary);
router.get('/documents', protect, require('../controllers/tax.controller').getDocuments); // [NEW] Documents List
router.delete('/reset', protect, require('../controllers/tax.controller').resetTaxData); // [NEW] Reset Data

module.exports = router;
