const IncomeTaxReturn = require('../models/IncomeTaxReturn');
const { logAction } = require('../services/auditService');
const { generateITRPdf } = require('../services/pdfService');
const { generateITRExcel } = require('../services/excelService');

// @desc    Start New ITR Filing (or get draft)
// @route   POST /api/itr/start
// @access  Private
exports.startFiling = async (req, res) => {
    try {
        const { financialYear } = req.body;
        
        // Check for existing draft
        let itr = await IncomeTaxReturn.findOne({
            user: req.user._id,
            financialYear: financialYear || '2024-2025',
            status: { $in: ['draft', 'saved'] }
        });

        if (!itr) {
            itr = await IncomeTaxReturn.create({
                user: req.user._id,
                financialYear: financialYear || '2024-2025',
                status: 'draft'
            });
        }

        res.json(itr);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update ITR Details (Generic for steps)
// @route   PUT /api/itr/:id
// @access  Private
exports.updateITR = async (req, res) => {
    try {
        const { itrForm, income, deductions, bankDetails, regime } = req.body;
        
        const itr = await IncomeTaxReturn.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!itr) return res.status(404).json({ message: 'ITR not found' });
        if (itr.status === 'filed') return res.status(400).json({ message: 'Cannot edit filed return' });

        if (itrForm) itr.itrForm = itrForm;
        if (income) itr.income = { ...itr.income, ...income };
        if (deductions) itr.deductions = { ...itr.deductions, ...deductions };
        if (bankDetails) itr.bankDetails = bankDetails;
        if (regime) itr.regime = regime;

        itr.status = 'saved';
        await itr.save();

        res.json(itr);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Calculate Tax for ITR
// @route   POST /api/itr/:id/calculate
// @access  Private
exports.calculateTax = async (req, res) => {
    try {
        const itr = await IncomeTaxReturn.findById(req.params.id);
        if (!itr) return res.status(404).json({ message: 'ITR not found' });

        // Calculate (Mock Logic - in real app, share logic with frontend or use rigorous engine)
        // Simple logic for verifying flow
        
        const totalIncome = (itr.income.salary.net || 0) + 
                          (itr.income.houseProperty || 0) + 
                          (itr.income.otherSources || 0);

        let totalDeductions = 0;
        if (itr.regime === 'old') {
            totalDeductions = (itr.deductions.section80C || 0) + 
                            (itr.deductions.section80D || 0) + 
                            (itr.deductions.hra || 0) + 
                            50000; // std ded
        } else {
             totalDeductions = 75000; // New regime std deduction
        }

        const taxableIncome = Math.max(0, totalIncome - totalDeductions);
        
        // Tax Calc (Simple % for prototype)
        let tax = 0;
        if (taxableIncome > 700000) tax = (taxableIncome - 700000) * 0.10; // rough calc
        
        const cess = tax * 0.04;
        const totalTaxLiability = tax + cess;
        
        const refundDue = Math.max(0, (itr.computation.tdsCredit || 0) - totalTaxLiability);
        const amountPayable = Math.max(0, totalTaxLiability - (itr.computation.tdsCredit || 0));

        itr.computation = {
            taxableIncome,
            taxPayable: tax,
            cess,
            totalTaxLiability,
            tdsCredit: itr.computation.tdsCredit,
            refundDue,
            amountPayable
        };
        
        itr.status = 'calculated';
        await itr.save();

        res.json(itr);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit ITR
// @route   POST /api/itr/:id/submit
// @access  Private
exports.submitITR = async (req, res) => {
    try {
        const itr = await IncomeTaxReturn.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!itr) return res.status(404).json({ message: 'ITR not found' });

        itr.status = 'submitted';
        itr.filedAt = Date.now();
        itr.acknowledgementNumber = `ACK${Date.now()}${Math.floor(Math.random()*1000)}`;

        await itr.save();

        logAction({
            user: req.user,
            action: 'SUBMIT_ITR',
            resourceType: 'ITR',
            resourceId: itr._id,
            details: { acknowledgementNumber: itr.acknowledgementNumber },
            req
        });

        res.json({ message: 'ITR Submitted Successfully', acknowledgementNumber: itr.acknowledgementNumber });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ITR Summary for Visualization
// @route   GET /api/itr/:id/summary
// @access  Private
exports.getTaxSummary = async (req, res) => {
    try {
        const itr = await IncomeTaxReturn.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!itr) return res.status(404).json({ message: 'ITR not found' });

        // Ensure calculation is up to date (optional, but good practice)
        // For now, assuming 'computation' field is populated via calculate step or basic defaults
        
        const summary = {
            totalIncome: (itr.income.salary.net || 0) + (itr.income.otherSources || 0) + (itr.income.houseProperty || 0),
            totalDeductions: (itr.deductions.section80C || 0) + (itr.deductions.section80D || 0) + (itr.deductions.hra || 0),
            taxableIncome: itr.computation.taxableIncome,
            taxLiability: itr.computation.totalTaxLiability,
            taxAlreadyPaid: itr.computation.tdsCredit || 0,
            netPayable: itr.computation.amountPayable || 0,
            refundDue: itr.computation.refundDue || 0,
            breakdown: {
                incomeSources: [
                    { name: 'Salary', value: itr.income.salary.net || 0, color: '#4CAF50' },
                    { name: 'House Property', value: itr.income.houseProperty || 0, color: '#2196F3' },
                    { name: 'Other Sources', value: itr.income.otherSources || 0, color: '#FF9800' }
                ].filter(item => item.value > 0),
                deductions: [
                    { section: '80C', max: 150000, used: itr.deductions.section80C || 0 },
                    { section: '80D', max: 100000, used: itr.deductions.section80D || 0 }, // Using 1L as generic max for senior citizen parents
                    { section: 'HRA', max: null, used: itr.deductions.hra || 0 }
                ]
            }
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Export ITR as PDF
// @route   GET /api/itr/:id/export/pdf
// @access  Private
exports.exportPdf = async (req, res) => {
    try {
        const itr = await IncomeTaxReturn.findOne({ _id: req.params.id, user: req.user._id }).populate('user', 'name email');
        if (!itr) return res.status(404).json({ message: 'ITR not found' });

        const filename = `ITR_Report_${itr.financialYear}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        generateITRPdf(itr, res);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export ITR as Excel
// @route   GET /api/itr/:id/export/excel
// @access  Private
exports.exportExcel = async (req, res) => {
    try {
        const itr = await IncomeTaxReturn.findOne({ _id: req.params.id, user: req.user._id }).populate('user', 'name email');
        if (!itr) return res.status(404).json({ message: 'ITR not found' });

        const buffer = generateITRExcel(itr);
        const filename = `ITR_Data_${itr.financialYear}_${Date.now()}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload ITR Related Document (Form 16, etc.)
// @route   POST /api/itr/:id/document
// @access  Private
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { category } = req.body;
        
        const itr = await IncomeTaxReturn.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!itr) return res.status(404).json({ message: 'ITR not found' });

        // Add document to ITR
        itr.documents.push({
            category: category || 'other',
            fileUrl: req.file.path, // Cloudinary URL
            publicId: req.file.filename,
            fileName: req.file.originalname
        });

        await itr.save();

        res.json({
            message: 'Document Uploaded Successfully',
            documents: itr.documents,
            newlyUploaded: req.file.path
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
