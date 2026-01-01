const IncomeTaxReturn = require('../models/IncomeTaxReturn');
const Form16 = require('../models/Form16');
const form16Parser = require('../services/form16Parser');

// Helper: Calculate Tax (Simplified New Regime 2024-25)
const calculateTaxLiability = (taxableIncome) => {
    let tax = 0;
    // Standard Deduction considered handled in taxableIncome or UI
    // Slabs: 0-3L: Nil, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
    
    if (taxableIncome <= 300000) return 0;
    
    // 3L - 7L
    if (taxableIncome > 300000) {
        tax += Math.min(taxableIncome - 300000, 400000) * 0.05;
    }
    // 7L - 10L
    if (taxableIncome > 700000) {
        tax += Math.min(taxableIncome - 700000, 300000) * 0.10;
    }
    // 10L - 12L
    if (taxableIncome > 1000000) {
        tax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
    }
    // 12L - 15L
    if (taxableIncome > 1200000) {
        tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
    }
    // Above 15L
    if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
    }

    // Cess 4%
    return tax * 1.04;
};

// @desc    Calculate and Save Tax Return
// @route   POST /api/tax/calculate
// @access  Private
const calculateAndSaveTax = async (req, res) => {
    try {
        const { financialYear, income, deductions } = req.body;

        const totalIncome = (Number(income.salary) || 0) + 
                          (Number(income.business) || 0) + 
                          (Number(income.capitalGains) || 0) + 
                          (Number(income.otherSources) || 0);

        const totalDeductions = (Number(deductions.section80C) || 0) + 
                              (Number(deductions.section80D) || 0) + 
                              (Number(deductions.hra) || 0) + 
                              (Number(deductions.other) || 0);

        // Basic calculation (can be enhanced for Old/New regime switching)
        const taxableIncome = Math.max(0, totalIncome - totalDeductions);
        const taxPayable = calculateTaxLiability(taxableIncome);

        // Check if return exists for this year, else create
        let taxReturn = await IncomeTaxReturn.findOne({ 
            user: req.user._id, 
            financialYear: financialYear || '2024-2025' 
        });

        if (taxReturn) {
            taxReturn.income = income;
            taxReturn.deductions = deductions;
            taxReturn.taxableIncome = taxableIncome;
            taxReturn.taxPayable = taxPayable;
            await taxReturn.save();
        } else {
            taxReturn = await IncomeTaxReturn.create({
                user: req.user._id,
                financialYear: financialYear || '2024-2025',
                income,
                deductions,
                taxableIncome,
                taxPayable
            });
        }

        res.status(200).json(taxReturn);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Tax Returns
// @route   GET /api/tax/my-returns
// @access  Private
const getMyReturns = async (req, res) => {
    try {
        const returns = await IncomeTaxReturn.find({ user: req.user._id });
        res.status(200).json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload Form 16 & Extract Data
// @route   POST /api/tax/upload-form16
// @access  Private
const uploadForm16 = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const filePath = req.file.path;
        
        // Use Parser Service
        const extractedData = await form16Parser.parsePDF(filePath);

        // Save Extracted Data
        const savedForm16 = await Form16.create({
            user: req.user._id,
            financialYear: extractedData.financialYear,
            employer: extractedData.employer,
            salary: extractedData.salary,
            tds: extractedData.tds,
            originalFileName: req.file.originalname,
            fileUrl: filePath // In production, this would be an S3 URL
        });

        res.status(200).json({
            message: 'Form 16 processed successfully',
            data: savedForm16,
            parsed: extractedData
        });

    } catch (error) {
        console.error('Form 16 Processing Error:', error);
        res.status(500).json({ message: 'Failed to process Form 16', error: error.message });
    }
};

module.exports = {
    calculateAndSaveTax,
    getMyReturns,
    uploadForm16
};
