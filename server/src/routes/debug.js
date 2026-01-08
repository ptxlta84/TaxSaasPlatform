const express = require('express');
const router = express.Router();

// @route   POST /api/debug/form16-upload
// @desc    Simulate Form-16 extraction with mock data
// @access  Public (Debug only - Temporary)
router.post('/form16-upload', async (req, res) => {
  console.log('📄 DEBUG: Form16 upload attempt received');
  
  // Simulate extraction
  const mockData = {
    employer: {
      name: 'Test Corp Private Limited',
      tan: 'BLRE12345F',
      address: '123 Tech Park, Electronic City, Bangalore - 560100'
    },
    grossSalary: 850000,
    tdsDeducted: 75000,
    taxableSalary: 850000,
    exemptionsSection10: 20000,
    standardDeduction: 50000,
    professionalTax: 2400,
    parsedPart: 'B',
    form16Stage: 'PART_B_PARSED',
    matchReason: 'Debug Mock',
    extractedData: {
         grossSalary: 850000,
         tdsDeducted: 75000
    }
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  res.json({
    success: true,
    debug: true,
    extractedData: mockData,
    parsedPart: 'B',
    form16Stage: 'PART_B_PARSED',
    message: 'DEBUG MODE: Using mock data'
  });
});

module.exports = router;
