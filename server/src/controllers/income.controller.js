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

const { parseForm16 } = require('../utils/form16Parser');
const DeductionDetails = require('../models/DeductionDetails');

// @desc    Upload & Parse Form-16
// @route   POST /api/income/upload-form16
// @access  Private
exports.uploadForm16 = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // 1. Parse PDF
        let pdfBuffer;
        const fs = require('fs');

        if (req.file.buffer) {
            pdfBuffer = req.file.buffer;
        } else if (req.file.path) {
            pdfBuffer = fs.readFileSync(req.file.path);
            if (req.file.path.includes('temp') || req.file.path.includes('uploads')) {
                 fs.unlinkSync(req.file.path);
            }
        } else {
             return res.status(400).json({ message: 'File processing failed' });
        }
        
        console.log('Parsing Form-16...');
        const extractedData = await parseForm16(pdfBuffer);
        const { isPartA, isPartB } = extractedData;

        // 2. Fetch User State
        let income = await IncomeDetails.findOne({ user: req.user.id });
        if (!income) {
            income = new IncomeDetails({ user: req.user.id });
        }

        // 3. State Machine & Validation
        let parsedPart = "UNKNOWN";
        const matchReason = extractedData.matchReason || "Unknown Reason";

        // PRIORITY LOGIC: Part B wins always (enforced by Parser too, but double-checked here)
        if (isPartB) { 
            parsedPart = "B";
            
            // STRICT GUARD: Must have Part A first
            // Handle legacy docs (undefined stage) as NONE
            if (!income.form16Stage || income.form16Stage === 'NONE') {
                return res.status(400).json({ 
                    message: 'Please upload Form-16 Part A first.',
                    error_code: 'MISSING_PART_A'
                });
            }

            income.form16Stage = 'PART_B_PARSED';

            // Update Salary Fields
            income.salary = {
                ...income.salary,
                grossSalary: extractedData.grossSalary || income.salary.grossSalary,
                allowances: {
                    ...income.salary.allowances,
                    exemptSection10: extractedData.exemptionsSection10 || income.salary.allowances.exemptSection10
                },
                deductions: {
                    ...income.salary.deductions,
                    standardDeduction: extractedData.standardDeduction || income.salary.deductions.standardDeduction,
                    professionalTax: extractedData.professionalTax || income.salary.deductions.professionalTax
                }
            };

            // Enhanced Mapping: House Property & Other Sources (as requested "get value as it is")
            if (extractedData.incomeHouseProperty !== undefined) {
                 // Map directly to netIncome (loss is negative)
                 income.houseProperty = {
                     ...income.houseProperty,
                     netIncome: extractedData.incomeHouseProperty,
                     type: extractedData.incomeHouseProperty < 0 ? 'self' : 'let-out' // Heuristic defaults
                 };
            }

            if (extractedData.incomeOtherSources !== undefined) {
                // Map to 'other' bucket or total
                income.otherSources = {
                    ...income.otherSources,
                    other: extractedData.incomeOtherSources
                };
            }
        } else if (isPartA) { // Parser ensures isPartA is false if isPartB is true
            parsedPart = "A";
            // Always allow Part A upload (or re-upload)
            income.form16Stage = 'PART_A_PARSED';
            
            // Persist Employer Details
            if (extractedData.employer && extractedData.employer.name) {
                income.employer = {
                    name: extractedData.employer.name,
                    tan: extractedData.employer.tan,
                    address: extractedData.employer.address
                };
            }
        
        } else {
            // Unrecognized or Generic
             return res.status(400).json({ message: 'Could not identify Form-16 Part A or Part B. Please check the file.' });
        }

        await income.save();

        // FORENSIC LOGGING (MANDATORY)
        console.log(`DETECTED_FORM16_PART = ${parsedPart}`);
        console.log(`MATCH_REASON = ${matchReason}`);
        
        // STRICT CONTRACT RESPONSE
        const responsePayload = {
            parsedPart,
            form16Stage: income.form16Stage,
            extractedData, // Contains employer, tds, salary, houseProp, otherSources
            // Standard message for UI toast
            message: parsedPart === 'A' ? 'Part A parsed successfully. Please upload Part B to continue.' : 'Part B parsed successfully. Review salary details below.',
            updatedIncome: income,
            // DEBUG ECHO (MANDATORY per Step 4)
            __debug: {
                resolvedAs: parsedPart,
                form16Stage: income.form16Stage,
                matchReason,
                salaryFieldsFound: Object.keys(income.salary || {}).length > 0,
                hasNetTaxable: !!extractedData.taxableSalary,
                handler: "income.controller.js:uploadForm16",
                timestamp: new Date().toISOString()
            }
        };
        
        console.log("API RESPONSE:", JSON.stringify({
            parsedPart: responsePayload.parsedPart,
            form16Stage: responsePayload.form16Stage,
            debug: responsePayload.__debug
        }));

        res.json(responsePayload);

    } catch (err) {
        console.error('Form-16 Upload Error:', err);
        res.status(500).json({ message: 'Failed to process Form-16' });
    }
};

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
