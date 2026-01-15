const IncomeTaxReturn = require('../models/IncomeTaxReturn');
const Form16 = require('../models/Form16');
const { parseForm16 } = require('../utils/form16Parser');
const fs = require('fs');
const { cloudinary } = require('../config/cloudinary');

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
        
        // Read file buffer for real parser
        const fileBuffer = fs.readFileSync(filePath);

        // Use Real Parser Utility
        const extractedData = await parseForm16(fileBuffer);

        // ROBUSTNESS FIX: Normalize Financial Year
        // If parser fails or returns weird format, force a standard year for merging
        let normalizedYear = extractedData.financialYear;
        if (!normalizedYear || normalizedYear.length < 4) {
             console.warn('Parser missed Financial Year via Regex, defaulting to 2024-2025');
             normalizedYear = '2024-2025';
        }
        // Basic normalization (e.g. 2024-25 -> 2024-2025) could go here if needed.
        // For now, assume strict string matching.

        // ROBUSTNESS FIX: Handle "Scanned PDF" or "Parse Fail" (Empty Fields)
        const safeEmployer = {
            name: extractedData.employer?.name || "Unknown Employer (Parse Failed)",
            tan: extractedData.employer?.tan || "UNKNOWN_TAN",
            address: extractedData.employer?.address || ""
        };

        // UPLOAD TO CLOUDINARY (Hybrid Approach)
        // We have the file locally in /tmp (req.file.path), now we push it to Cloud for persistence
        console.log('Uploading to Cloudinary...');
        const cloudResult = await cloudinary.uploader.upload(filePath, {
            folder: 'taxsaas_documents',
            resource_type: 'auto',
            use_filename: true, 
            unique_filename: true
        });
        console.log('Cloudinary Upload Success:', cloudResult.secure_url);

        // Save Extracted Data with CLOUDINARY URL
        const savedForm16 = await Form16.create({
            user: req.user._id,
            financialYear: normalizedYear,
            employer: safeEmployer,
            salary: extractedData.salary || {},
            tds: extractedData.tds || {},
            originalFileName: req.file.originalname,
            fileUrl: cloudResult.secure_url // [CHANGED] Use permanent Cloudinary URL instead of local path
        });

        // --- AGGREGATION LOGIC (Fixed: Multi-Employer Support) ---
        // Fetch ALL Form-16s for this user & year to calculate totals
        const allForm16s = await Form16.find({ 
            user: req.user._id, 
            financialYear: normalizedYear 
        });

        const consolidated = allForm16s.reduce((acc, curr) => {
            acc.salary.gross += (curr.salary?.gross || 0);
            acc.salary.netTaxable += (curr.salary?.netTaxable || 0);
            acc.tds.taxDeducted += (curr.tds?.taxDeducted || 0);
            if(curr.employer?.name) acc.employers.push(curr.employer.name);
            return acc;
        }, {
            salary: { gross: 0, netTaxable: 0 },
            tds: { taxDeducted: 0 },
            employers: []
        });

        res.status(200).json({
            message: `Form 16 processed. Merged data from ${consolidated.employers.length} employers.`,
            data: savedForm16,
            parsed: extractedData,
            consolidated: consolidated // Frontend should use this for the "Total" view
        });

    } catch (error) {
        console.error('Form 16 Processing Error:', error);
        res.status(500).json({ message: 'Failed to process Form 16', error: error.message });
    } finally {
        // CLEANUP: Always remove the local file from /tmp to prevent disk bloat
        // This runs whether success or failure
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log(`Cleanup: Deleted temporary file ${req.file.path}`);
            } catch (cleanupErr) {
                console.error('Cleanup Warning: Failed to delete temp file:', cleanupErr);
            }
        }
    }
};

// @desc    Get Quick Tax Estimate (Old vs New)
// @route   POST /api/tax/estimate
// @access  Private
const estimateTax = async (req, res) => {
    // Lazy load dependencies to avoid circular issues or just standard require
    const { calculateTax } = require('../utils/taxCalculator');
    const TaxProfile = require('../models/TaxProfile');
    const { validationResult } = require('express-validator');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 1. Get User Profile for Age Calculation
        const profile = await TaxProfile.findOne({ user: req.user.id });
        
        // Default to age 30 if no profile or DOB
        let age = 30;
        if (profile && profile.dateOfBirth) {
            const dob = new Date(profile.dateOfBirth);
            const diffMs = Date.now() - dob.getTime();
            const ageDate = new Date(diffMs); 
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        // 2. Extract Income Details from Request
        const { grossIncome, otherIncome = 0, deductions80C = 0, deductions80D = 0, hra = 0, otherDeductions = 0 } = req.body;

        const totalIncome = Number(grossIncome) + Number(otherIncome);
        const deductionDetails = {
            section80C: Number(deductions80C),
            section80D: Number(deductions80D),
            hra: Number(hra),
            other: Number(otherDeductions)
        };

        // 3. Calculate
        const result = calculateTax(
            { grossTotalIncome: totalIncome, deductions: deductionDetails },
            { age: age }
        );

        res.json({
            profileUsed: { age },
            result
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get Comprehensive Tax Summary (Dashboard)
// @route   GET /api/tax/summary
// @access  Private
const getTaxSummary = async (req, res) => {
    try {
        const IncomeDetails = require('../models/IncomeDetails');
        const DeductionDetails = require('../models/DeductionDetails');
        const TaxProfile = require('../models/TaxProfile');
        const { calculateTax } = require('../utils/taxCalculator');

        // 1. Fetch all required data in parallel
        const [incomeData, deductionData, profileData] = await Promise.all([
            IncomeDetails.findOne({ user: req.user.id }),
            DeductionDetails.findOne({ user: req.user.id }),
            TaxProfile.findOne({ user: req.user.id })
        ]);

        // 2. Process Age
        let age = 30;
        if (profileData && profileData.dateOfBirth) {
             const dob = new Date(profileData.dateOfBirth);
             const diffMs = Date.now() - dob.getTime();
             const ageDate = new Date(diffMs); 
             age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        // 3. Process Income
        const grossTotalIncome = incomeData ? incomeData.grossTotalIncome : 0;

        // 4. Process Deductions
        const deductions = {
            section80C: deductionData ? deductionData.section80C.total : 0,
            section80D: deductionData ? deductionData.section80D.total : 0,
            hra: 0, // Not explicitly tracked in deduction module yet, maybe part of salary allowances?
            other: deductionData ? deductionData.otherDeductions.total : 0
        };
        const totalDeductionsClaimed = deductionData ? deductionData.grossTotalDeductions : 0;

        // 5. Calculate Tax
        const taxResult = calculateTax(
            { grossTotalIncome, deductions },
            { age }
        );

        // 6. Calculate Completion Score (Gamification)
        let progress = 0;
        if (profileData) progress += 30;
        if (incomeData) progress += 40;
        if (deductionData) progress += 30;

        res.json({
            grossTotalIncome,
            totalDeductionsClaimed,
            taxResult,
            completion: {
                score: progress,
                steps: {
                    profile: !!profileData,
                    income: !!incomeData,
                    deductions: !!deductionData
                }
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get All Uploaded Documents
// @route   GET /api/tax/documents
// @access  Private
const getDocuments = async (req, res) => {
    try {
        const form16s = await Form16.find({ user: req.user._id }).sort({ createdAt: -1 });
        
        // Map to standardized format for frontend
        const docs = form16s.map(doc => ({
            _id: doc._id,
            fileName: doc.originalFileName || `Form16-${doc.financialYear}.pdf`,
            originalUrl: doc.fileUrl, // Ensure this path is accessible (e.g. /uploads/...) or S3
            uploadedAt: doc.createdAt,
            financialYear: doc.financialYear,
            category: 'form16'
        }));

        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

// @desc    Reset/Clear All My Tax Data (For Testing)
// @route   DELETE /api/tax/reset
// @access  Private
const resetTaxData = async (req, res) => {
    try {
        await Form16.deleteMany({ user: req.user._id });
        await IncomeTaxReturn.deleteMany({ user: req.user._id });
        res.status(200).json({ message: 'All tax data cleared successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset data', error: error.message });
    }
};

module.exports = {
    calculateAndSaveTax,
    getMyReturns,
    uploadForm16,
    estimateTax,
    getTaxSummary,
    resetTaxData,
    getDocuments
};
