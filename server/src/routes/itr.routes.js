const express = require('express');
const router = express.Router();
const { startFiling, updateITR, calculateTax, submitITR, getTaxSummary, exportPdf, exportExcel } = require('../controllers/itr.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/start', protect, startFiling);
router.put('/:id', protect, updateITR);
router.post('/:id/calculate', protect, calculateTax);
router.get('/:id/summary', protect, getTaxSummary);
router.get('/:id/export/pdf', protect, exportPdf);
router.get('/:id/export/excel', protect, exportExcel);
router.post('/:id/submit', protect, submitITR);

module.exports = router;
