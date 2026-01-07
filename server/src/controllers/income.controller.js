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

        // 1. Parse PDF from Buffer (Multer memory storage ideally)
        // If coming from Cloudinary, we might need to fetch the file URL or upload buffer directly
        // Assuming fileUpload middleware provides access to file buffer or path
        
        let pdfBuffer;
        const fs = require('fs');

        if (req.file.buffer) {
            pdfBuffer = req.file.buffer;
        } else if (req.file.path) {
             // If saved to disk or temp
            pdfBuffer = fs.readFileSync(req.file.path);
             // Cleanup temp file if needed
            if (req.file.path.includes('temp') || req.file.path.includes('uploads')) {
                 fs.unlinkSync(req.file.path);
            }
        } else {
             return res.status(400).json({ message: 'File processing failed' });
        }
        
        console.log('Parsing Form-16...');
        const extractedData = await parseForm16(pdfBuffer);

        // 2. Auto-Fill IncomeDetails
        let income = await IncomeDetails.findOne({ user: req.user.id });
        if (!income) {
            income = new IncomeDetails({ user: req.user.id });
        }

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
                standardDeduction: extractedData.standardDeduction || 50000, // Use parsed or default
                professionalTax: extractedData.professionalTax || 0
            }
        };

        // If parser found section 16 specific value greater than standard, use logic, 
        // but typically 50k is separate. Let's trust parser for "deductionsSection16" minus 50k?
        // Actually, let's keep it simple: mapped gross and exempt10. 
        // Users can manually adjust Standard Deduction/Prof Tax.
        
        // 3. Auto-Fill Deductions (TDS at least, maybe 80C if we parsed it properly - parser only had basic regex)
        // Let's update Deductions if we add regex for it in parser later. 
        // For now, let's just update TDS in a Tax/TDS model? 
        // Currently we don't have a "TDS Paid" field in Income/Deduction models explicitly except maybe "Advance Tax"?
        // We will return TDS in the response for the frontend to show or save elsewhere.

        await income.save();

        res.json({
            message: 'Form-16 processed successfully',
            extractedData,
            updatedIncome: income
        });

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
