const GSTRegistration = require('../models/GSTRegistration');

// @desc    Register for GST (Create/Update Application)
// @route   POST /api/gst/register
// @access  Private
exports.registerGST = async (req, res) => {
    try {
        // const { ... } = req.body; // Removed unused destructuring

        // Check if registration already exists for user
        let registration = await GSTRegistration.findOne({ userId: req.user._id });

        if (registration) {
            // Update existing draft
            registration = await GSTRegistration.findOneAndUpdate(
                { userId: req.user._id },
                { $set: req.body },
                { new: true }
            );
        } else {
            // Create new
            registration = await GSTRegistration.create({
                userId: req.user._id,
                ...req.body,
                status: 'draft'
            });
        }

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        console.error("GST Registration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get GST Registration Status
// @route   GET /api/gst/status
// @access  Private
exports.getRegistrationStatus = async (req, res) => {
    try {
        const registration = await GSTRegistration.findOne({ userId: req.user._id });
        if (!registration) {
            return res.status(404).json({ success: false, message: 'No registration found' });
        }
        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Validate GSTIN (Mock Real-time check)
// @route   POST /api/gst/validate-gstin
// @access  Private
exports.validateGSTIN = async (req, res) => {
    const { gstin } = req.body;
    // Regex Check
    const regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
    const isValidFormat = regex.test(gstin);

    if (!isValidFormat) {
        return res.status(400).json({ valid: false, message: 'Invalid Format' });
    }

    // Mock Database Check
    const exists = await GSTRegistration.findOne({ gstin });
    if (exists) {
        return res.status(400).json({ valid: false, message: 'GSTIN already registered' });
    }

    res.json({ valid: true, message: 'GSTIN is valid and available' });
};
