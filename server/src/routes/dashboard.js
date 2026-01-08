const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getDashboardState } = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/state', getDashboardState);

module.exports = router;
