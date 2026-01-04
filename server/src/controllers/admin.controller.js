const User = require('../models/User');
const UserITR = require('../models/IncomeTaxReturn');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalITRs = await UserITR.countDocuments();
    
    // Aggregate ITR status counts
    const startStats = await UserITR.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = {
        users: totalUsers,
        itrs: totalITRs,
        itrStatus: startStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {})
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
