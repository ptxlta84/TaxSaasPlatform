const validationService = require('../src/services/validation/itrValidation.service');

// Mock Data
const validData = {
    partA_General: {
        pan: 'ABCDE1234F',
        filingSection: '139(1)', // On Time
        regime: 'NEW' 
    },
    // Other fields optional for this test
};

const invalidPANData = {
    partA_General: {
        pan: 'INVALIDPAN', // Wrong pattern
        filingSection: '139(1)'
    }
};

const invalidRevisedData = {
    partA_General: {
        pan: 'ABCDE1234F',
        filingSection: '139(5)', // Revised
        // Missing originalAcknowledgementNumber
    }
};

console.log("Running Validation Tests...\n");

// Test 1: Valid Data
const res1 = validationService.validate(validData);
if (res1.isValid) {
    console.log("✅ Test 1 (Valid Data): PASSED");
} else {
    console.error("❌ Test 1 (Valid Data): FAILED", res1.errors);
}

// Test 2: Invalid PAN
const res2 = validationService.validate(invalidPANData);
if (!res2.isValid && res2.errors[0].message.includes('Invalid PAN')) {
    console.log("✅ Test 2 (Invalid PAN): PASSED (Caught Error)");
} else {
    console.error("❌ Test 2 (Invalid PAN): FAILED. Expected PAN error.", res2.errors);
}

// Test 3: Missing Original Ack No for Revised Return
const res3 = validationService.validate(invalidRevisedData);
if (!res3.isValid && res3.errors.find(e => e.errorCode === 'ITR-1-004')) {
    console.log("✅ Test 3 (Defective 139(5)): PASSED (Caught Defect)");
} else {
    console.error("❌ Test 3 (Defective 139(5)): FAILED. Expected ITR-1-004 error.", res3.errors);
}
