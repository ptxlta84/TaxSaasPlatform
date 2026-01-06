const express = require('express');
const router = express.Router();
const { getIncomeDetails, updateIncomeDetails, uploadForm16 } = require('../controllers/income.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/fileUpload'); // Assuming standard multer middleware exists

router.get('/', protect, getIncomeDetails);
router.post('/', protect, updateIncomeDetails);
router.post('/upload-form16', protect, upload.single('file'), uploadForm16);

module.exports = router;
