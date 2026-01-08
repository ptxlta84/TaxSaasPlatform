const { calculateDashboardState } = require('../services/dashboardStateService');

// @desc    Get User Dashboard State
// @route   GET /api/dashboard/state
// @access  Private
exports.getDashboardState = async (req, res) => {
    try {
        const stateData = await calculateDashboardState(req.user._id);
        res.json(stateData);
    } catch (error) {
        console.error('Dashboard State Error:', error);
        res.status(500).json({ message: 'Server Error calculating dashboard state' });
    }
};
