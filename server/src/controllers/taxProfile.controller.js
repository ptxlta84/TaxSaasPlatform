const TaxProfile = require('../models/TaxProfile');
const { validationResult } = require('express-validator');

// @desc    Get current user's tax profile
// @route   GET /api/tax-profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const profile = await TaxProfile.findOne({ user: req.user.id })
      .populate('user', 'name email mobile panNumber'); // Populate fields from User model

    if (!profile) {
      // If no profile exists, return basic user info to pre-fill frontend
      const user = await req.user.model.findById(req.user.id).select('name email mobile panNumber');
      return res.json({ 
        user: user, // Send user info even if profile doesn't exist
        isNew: true 
      });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create or update user tax profile
// @route   POST /api/tax-profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    dateOfBirth,
    gender,
    fatherName,
    residentialStatus,
    employerCategory,
    alternateMobile,
    address,
    dependents,
    bankAccounts
  } = req.body;

  // Build profile object
  const profileFields = {
    user: req.user.id,
    dateOfBirth,
    gender,
    fatherName,
    residentialStatus,
    employerCategory,
    alternateMobile,
    address
  };
  
  if (dependents) profileFields.dependents = dependents;
  if (bankAccounts) profileFields.bankAccounts = bankAccounts;

  try {
    let profile = await TaxProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await TaxProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = new TaxProfile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
