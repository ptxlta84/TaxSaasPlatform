const IncomeTaxReturn = require('../models/IncomeTaxReturn');
// const axios = require('axios');

// @desc    Get All Documents for User (Aggregated from ITRs)
// @route   GET /api/documents
// @access  Private
// Helper to fix missing version in Cloudinary URLs
const fixCloudinaryUrl = (oldUrl) => {
    if (!oldUrl || !oldUrl.includes('cloudinary.com')) return oldUrl;
    
    // Check if version already exists (e.g., /v123456789/)
    if (oldUrl.includes('/v1') || oldUrl.includes('/v2')) return oldUrl; // simple check for v+timestamp starting with 1 or 2
    
    // Extract filename
    // Cloudinary format: .../upload/v<version>/<filename> OR .../upload/<filename>
    // If missing version: .../upload/<filename>
    
    const parts = oldUrl.split('/upload/');
    if (parts.length < 2) return oldUrl;
    
    const baseUrl = parts[0];
    const rest = parts[1];
    
    // Generate new versioned URL (v + current timestamp/static)
    // Note: Cloudinary doesn't require *exact* upload timestamp for fetched, just *a* version number to bypass cache often, 
    // BUT if the file exists without version, accessing with random version might fail if not configured? 
    // Actually, Cloudinary usually ignores version number for delivery if Public ID matches, BUT requires it for structure sometimes.
    // User says "Working URL format discovered... v1767873859".
    // Let's use a dynamic one or current time as requested. 
    // Ideally we should store the 'version' from upload response. If lost, we guess or query.
    // Using Date.now() as requested by user.
    
    const version = 'v' + Math.floor(Date.now() / 1000); 
    // User logic: const version = 'v' + Date.now();
    
    return `${baseUrl}/upload/${version}/${rest}`;
};

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
                    const fixedUrl = fixCloudinaryUrl(doc.fileUrl);
                    
                    return {
                        _id: doc._id,
                        itrId: itr._id,
                        financialYear: itr.financialYear,
                        category: doc.category,
                        fileName: doc.fileName,
                        originalUrl: fixedUrl,
                        downloadUrl: fixedUrl,
                        // User requested direct URL simplify. Proxy logic kept in controller but frontend might ignore it.
                        // I will set previewUrl to fixedUrl as per Step 1 request.
                        previewUrl: fixedUrl, 
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
exports.previewDocument = (req, res) => {
    try {
        const { url } = req.query;

        // ENHANCED LOGGING (Step 2)
        // eslint-disable-next-line no-console
        console.info('PDF Preview Request:', {
            userId: req.user ? req.user.id : 'Unauthenticated',
            requestedUrl: url,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });

        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        // eslint-disable-next-line no-console
        console.info('Processing PDF URL:', {
            url: url.substring(0, 100), // Log first 100 chars
            isCloudinary: url.includes('cloudinary.com')
        });

        // Option 1: If Cloudinary URL, redirect to Cloudinary directly (Proposed Temporary Fix)
        if (url.includes('cloudinary.com')) {
            // Transform for PDF display (force attachment if needed, or inline)
            // User instruction said: replace('/upload/', '/upload/fl_attachment/')
            const cloudinaryUrl = url.replace('/upload/', '/upload/fl_attachment/');
            // eslint-disable-next-line no-console
            console.info('Redirecting to Cloudinary:', cloudinaryUrl);

            // Method A: Redirect (simplest)
            return res.redirect(cloudinaryUrl);
        }

        // Option 2: For other URLs, redirect directly
        // eslint-disable-next-line no-console
        console.info('Redirecting to direct URL');
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
