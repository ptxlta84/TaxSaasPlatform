const User = require('../models/User');
const UserITR = require('../models/IncomeTaxReturn');
const TaxProfile = require('../models/TaxProfile');
const IncomeDetails = require('../models/IncomeDetails');
const DeductionDetails = require('../models/DeductionDetails');
const { calculateTax } = require('../utils/taxCalculator');

// @desc    Get all users (Admin only) with Search & Pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    // Enrich with profile completion status (lightweight check)
    const enrichedUsers = await Promise.all(users.map(async (user) => {
        const profile = await TaxProfile.exists({ user: user._id });
        const income = await IncomeDetails.exists({ user: user._id });
        let progress = 0;
        if (profile) progress += 30;
        if (income) progress += 40;
        // Deductions check skipped for list view perf, or add if needed
        return { ...user.toObject(), profileCompletion: progress };
    }));

    res.json({
      users: enrichedUsers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Single User Full Details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [profile, income, deductions, itr] = await Promise.all([
            TaxProfile.findOne({ user: userId }),
            IncomeDetails.findOne({ user: userId }),
            DeductionDetails.findOne({ user: userId }),
            UserITR.findOne({ user: userId, financialYear: '2024-2025' }) // Current FY
        ]);

        // Calculate Tax Estimate Live
        let taxEstimate = null;
        if (income) {
             const grossTotalIncome = income.grossTotalIncome || 0;
             const deductionValues = {
                section80C: deductions ? deductions.section80C.total : 0,
                section80D: deductions ? deductions.section80D.total : 0,
                hra: 0,
                other: deductions ? deductions.otherDeductions.total : 0
            };
            
            // Age
            let age = 30;
            if (profile && profile.dateOfBirth) {
                const dob = new Date(profile.dateOfBirth);
                const diffMs = Date.now() - dob.getTime();
                const ageDate = new Date(diffMs); 
                age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            taxEstimate = calculateTax({ grossTotalIncome, deductions: deductionValues }, { age });
        }

        res.json({
            user,
            profile,
            income,
            deductions,
            itr,
            taxEstimate
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    const usersWithIncome = await IncomeDetails.countDocuments();
    const usersWithDeductions = await DeductionDetails.countDocuments();

    // Stats
    const stats = {
        totalUsers,
        newUsersToday,
        engagement: {
            incomeEntered: usersWithIncome,
            deductionsClaimed: usersWithDeductions
        },
        regimeDistribution: {
            old: 0, // Placeholder for future logic
            new: 0
        }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
