const express = require('express');
const router = express.Router();
const { getDeductions, updateDeductions } = require('../controllers/deduction.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getDeductions);
router.post('/', protect, updateDeductions);

module.exports = router;
