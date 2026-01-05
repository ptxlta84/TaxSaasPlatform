const IncomeDetails = require('../models/IncomeDetails');

// @desc    Get Income Details
// @route   GET /api/income
// @access  Private
exports.getIncomeDetails = async (req, res) => {
  try {
    let income = await IncomeDetails.findOne({ user: req.user.id });
    if (!income) {
        return res.json({ isNew: true, income: {} });
    }
    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update Income Details
// @route   POST /api/income
// @access  Private
exports.updateIncomeDetails = async (req, res) => {
  try {
    const { salary, houseProperty, business, capitalGains, otherSources } = req.body;

    let income = await IncomeDetails.findOne({ user: req.user.id });

    if (income) {
      // Update existing
      if(salary) income.salary = { ...income.salary, ...salary };
      if(houseProperty) income.houseProperty = { ...income.houseProperty, ...houseProperty };
      if(business) income.business = { ...income.business, ...business };
      if(capitalGains) income.capitalGains = { ...income.capitalGains, ...capitalGains };
      if(otherSources) income.otherSources = { ...income.otherSources, ...otherSources };
    } else {
      // Create new
      income = new IncomeDetails({
        user: req.user.id,
        salary,
        houseProperty,
        business,
        capitalGains,
        otherSources
      });
    }

    await income.save(); // Triggers pre-save calculation
    res.json(income);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
