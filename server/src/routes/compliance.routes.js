const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const { generateInvoicePDF } = require('../services/pdfService');
const GSTInvoice = require('../models/GSTInvoice');
const { logAction } = require('../services/auditService');

// @desc    Upload Tax Document
// @route   POST /api/compliance/upload
// @access  Private
router.post('/upload', protect, upload.single('doc'), async (req, res) => {
    try {
        await logAction({
            user: req.user,
            action: 'UPLOAD_DOC',
            details: { filename: req.file.filename },
            req
        });
        res.send(`/${req.file.path}`);
    } catch (error) {
        res.status(400).send('Error uploading file');
    }
});

// @desc    Download Invoice PDF
// @route   GET /api/compliance/invoice/:id/pdf
// @access  Private
router.get('/invoice/:id/pdf', protect, async (req, res) => {
    try {
        const invoice = await GSTInvoice.findById(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check ownership
        if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
           return res.status(401).json({ message: 'Not authorized' }); 
        }

        generateInvoicePDF(invoice, res);
        
        await logAction({
            user: req.user,
            action: 'DOWNLOAD_PDF',
            resourceType: 'Invoice',
            resourceId: invoice._id,
            req
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
