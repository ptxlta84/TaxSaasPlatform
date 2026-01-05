const express = require('express');
const router = express.Router();
const { getIncomeDetails, updateIncomeDetails } = require('../controllers/income.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getIncomeDetails);
router.post('/', protect, updateIncomeDetails);

module.exports = router;
