const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const { getProfile, createOrUpdateProfile } = require('../controllers/taxProfile.controller');

// @route   GET /api/tax-profile
// @desc    Get current user's profile
// @access  Private
router.get('/', protect, getProfile);

// @route   POST /api/tax-profile
// @desc    Create or update profile
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('dateOfBirth', 'Date of Birth is required').not().isEmpty(),
      check('gender', 'Gender is required').isIn(['male', 'female', 'other']),
      check('fatherName', 'Father Name is required').not().isEmpty(),
      check('residentialStatus', 'Residential Status is invalid').isIn(['resident', 'non_resident', 'resident_not_ordinary']),
      check('address.city', 'City is required').not().isEmpty(),
      check('address.state', 'State is required').not().isEmpty(),
      check('address.pincode', 'Valid 6-digit Pincode is required').matches(/^[1-9][0-9]{5}$/)
    ]
  ],
  createOrUpdateProfile
);

module.exports = router;
