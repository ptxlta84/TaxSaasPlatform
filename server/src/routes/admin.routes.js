const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDetails, getSystemStats } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');

// Protect all routes with auth + admin check
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.get('/stats', getSystemStats);

module.exports = router;
