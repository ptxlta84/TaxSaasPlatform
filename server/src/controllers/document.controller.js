const IncomeTaxReturn = require('../models/IncomeTaxReturn');
const axios = require('axios'); // For proxying Cloudinary stream

// @desc    Get All Documents for User (Aggregated from ITRs)
// @route   GET /api/documents
// @access  Private
exports.getUserDocuments = async (req, res) => {
    try {
        const itrs = await IncomeTaxReturn.find({ user: req.user._id })
            .select('financialYear documents')
            .sort({ createdAt: -1 });

        let allDocs = [];
        itrs.forEach(itr => {
            if (itr.documents && itr.documents.length > 0) {
                const docsWithMeta = itr.documents.map(doc => {
                    // TRANSFORM URL TO PROXY
                    const proxyUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/documents/preview?url=${encodeURIComponent(doc.fileUrl)}&mimeType=application/pdf`;
                    
                    return {
                        _id: doc._id,
                        itrId: itr._id,
                        financialYear: itr.financialYear,
                        category: doc.category,
                        fileName: doc.fileName,
                        originalUrl: doc.fileUrl,
                        previewUrl: proxyUrl, // <--- Key Change
                        uploadedAt: doc.uploadedAt
                    };
                });
                allDocs = [...allDocs, ...docsWithMeta];
            }
        });

        res.json(allDocs);

    } catch (error) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({ message: 'Server Error fetching documents' });
    }
};

// SIMPLIFIED PROXY - Version 1.0
exports.previewDocument = async (req, res) => {
    try {
        const { url } = req.query;

        // ENHANCED LOGGING (Step 2)
        console.log('PDF Preview Request:', {
            userId: req.user ? req.user.id : 'Unauthenticated',
            requestedUrl: url,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });

        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        console.log('Processing PDF URL:', {
            url: url.substring(0, 100), // Log first 100 chars
            isCloudinary: url.includes('cloudinary.com')
        });

        // Option 1: If Cloudinary URL, redirect to Cloudinary directly (Proposed Temporary Fix)
        if (url.includes('cloudinary.com')) {
            // Transform for PDF display (force attachment if needed, or inline)
            // User instruction said: replace('/upload/', '/upload/fl_attachment/')
            const cloudinaryUrl = url.replace('/upload/', '/upload/fl_attachment/');
            console.log('Redirecting to Cloudinary:', cloudinaryUrl);

            // Method A: Redirect (simplest)
            return res.redirect(cloudinaryUrl);
        }

        // Option 2: For other URLs, redirect directly
        console.log('Redirecting to direct URL');
        return res.redirect(url);

    } catch (error) {
        // ENHANCED ERROR LOGGING (Step 2)
        console.error('PDF Preview CRITICAL ERROR:', {
            error: error.message,
            stack: error.stack,
            url: req.query.url,
            userId: req.user ? req.user.id : 'unknown',
            userEmail: req.user ? req.user.email : 'unknown',
            cloudinaryUrl: req.query.url && req.query.url.includes('cloudinary.com') ? 'YES' : 'NO',
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            error: 'Failed to load PDF document',
            requestId: Date.now(),
            supportContact: 'support@taxsaas.com',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
