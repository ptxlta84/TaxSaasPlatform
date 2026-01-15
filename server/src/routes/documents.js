const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getUserDocuments, previewDocument } = require('../controllers/document.controller');

// All routes are protected
router.use(protect);

router.get('/', getUserDocuments);
// TEST ENDPOINT: GET /api/documents/preview?test=1
router.get('/preview', (req, res, next) => {
  const { test } = req.query;
  
  // Diagnostic test endpoint
  if (test === '1') {
    // Check auth manually or rely on router.use(protect) above? 
    // Router uses protect globally. User instruction implies 'authenticate' middleware, which we have as 'protect'.
    // We can assume req.user is populated if protect is valid.
    
    console.log('PDF Diagnostic Test Request:', {
      user: req.user ? req.user.email : 'Unauthenticated',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      query: req.query
    });
    
    return res.json({
      status: 'diagnostic',
      user: req.user ? req.user.email : 'Unauthenticated',
      documentsCount: req.user && req.user.documents ? req.user.documents.length : 'N/A', // user might not have documents populated depending on middleware
      environment: process.env.NODE_ENV,
      serverTime: new Date().toISOString(),
      cloudinaryConfig: {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
      }
    });
  }
  next(); // Not test, proceed to controller
}, previewDocument);

module.exports = router;
