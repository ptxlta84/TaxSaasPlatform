const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const { getAllUsers, getSystemStats } = require('../controllers/admin.controller');

// All routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);

module.exports = router;
