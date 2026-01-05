const DeductionDetails = require('../models/DeductionDetails');

// @desc    Get Deduction Details
// @route   GET /api/deductions
// @access  Private
exports.getDeductions = async (req, res) => {
  try {
    let deductions = await DeductionDetails.findOne({ user: req.user.id });
     if (!deductions) {
        return res.json({ isNew: true, deductions: {} });
    }
    res.json(deductions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update Deduction Details
// @route   POST /api/deductions
// @access  Private
exports.updateDeductions = async (req, res) => {
  try {
    const { section80C, section80D, otherDeductions } = req.body;

    let deductions = await DeductionDetails.findOne({ user: req.user.id });

    if (deductions) {
      if(section80C) deductions.section80C = { ...deductions.section80C, ...section80C };
      if(section80D) deductions.section80D = { ...deductions.section80D, ...section80D };
      if(otherDeductions) deductions.otherDeductions = { ...deductions.otherDeductions, ...otherDeductions };
    } else {
      deductions = new DeductionDetails({
        user: req.user.id,
        section80C,
        section80D,
        otherDeductions
      });
    }

    await deductions.save();
    res.json(deductions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
