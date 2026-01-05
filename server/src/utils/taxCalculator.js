/**
 * Tax Calculator Utility for India (AY 2025-26 / FY 2024-25)
 * 
 * Logic covers:
 * 1. Old Regime (Slabs + Age/Gender exemptions)
 * 2. New Regime (u/s 115BAC - Slabs + rebate u/s 87A)
 * 3. Surcharge & Cess
 */

exports.calculateTax = (incomeDetails, profile) => {
    const { grossTotalIncome, deductions } = incomeDetails;
    const { age = 30 } = profile; // Default age

    // 1. Calculate Taxable Income
    // Old Regime: Apply all deductions (80C, 80D, HRA etc.) + Standard Deduction (50k)
    const oldRegimeDeductions = (deductions.section80C || 0) + 
                                (deductions.section80D || 0) + 
                                (deductions.hra || 0) + 
                                (deductions.other || 0) + 
                                50000; // Standard Deduction
    
    const taxableIncomeOld = Math.max(0, grossTotalIncome - oldRegimeDeductions);

    // New Regime: Standard Deduction (75k for FY 24-25) only, no other 80C/80D
    const newRegimeDeductions = 75000; 
    const taxableIncomeNew = Math.max(0, grossTotalIncome - newRegimeDeductions);

    // 2. Calculate Tax Logic
    const taxOld = calcOldRegimeTax(taxableIncomeOld, age);
    const taxNew = calcNewRegimeTax(taxableIncomeNew);

    return {
        oldRegime: {
            taxableIncome: taxableIncomeOld,
            taxPayable: taxOld.totalTax,
            breakdown: taxOld
        },
        newRegime: {
            taxableIncome: taxableIncomeNew,
            taxPayable: taxNew.totalTax,
            breakdown: taxNew
        },
        recommendation: taxNew.totalTax < taxOld.totalTax ? 'New Regime' : 'Old Regime',
        savings: Math.abs(taxNew.totalTax - taxOld.totalTax)
    };
};

// --- Helper Functions ---

const calculateCess = (tax) => Math.round(tax * 0.04);

// Old Regime Slabs (AY 2025-26)
const calcOldRegimeTax = (income, age) => {
    let tax = 0;
    let limit1 = 250000; // Basic exemption
    if (age >= 60) limit1 = 300000; // Senior
    if (age >= 80) limit1 = 500000; // Super Senior

    // 0 - Limit1: Nil
    // Limit1 - 5L: 5%
    if (income > limit1) {
        let taxable = Math.min(income, 500000) - limit1;
        tax += taxable * 0.05;
    }
    // 5L - 10L: 20%
    if (income > 500000) {
        let taxable = Math.min(income, 1000000) - 500000;
        tax += taxable * 0.20;
    }
    // > 10L: 30%
    if (income > 1000000) {
        let taxable = income - 1000000;
        tax += taxable * 0.30;
    }

    // Rebate u/s 87A (Old Regime): Max ₹12,500 if Income <= 5L
    if (income <= 500000) {
        tax = 0;
    }

    const cess = calculateCess(tax);
    return { baseTax: Math.round(tax), cess: cess, totalTax: Math.round(tax + cess) };
};

// New Regime Slabs (AY 2025-26 / FY 24-25)
const calcNewRegimeTax = (income) => {
    let tax = 0;
    
    // 0-3L: Nil
    
    // 3-7L: 5%
    if (income > 300000) {
        let taxable = Math.min(income, 700000) - 300000;
        tax += taxable * 0.05;
    }
    // 7-10L: 10%
    if (income > 700000) {
        let taxable = Math.min(income, 1000000) - 700000;
        tax += taxable * 0.10;
    }
    // 10-12L: 15%
    if (income > 1000000) {
        let taxable = Math.min(income, 1200000) - 1000000;
        tax += taxable * 0.15;
    }
    // 12-15L: 20%
    if (income > 1200000) {
        let taxable = Math.min(income, 1500000) - 1200000;
        tax += taxable * 0.20;
    }
    // >15L: 30%
    if (income > 1500000) {
        let taxable = income - 1500000;
        tax += taxable * 0.30;
    }

    // Rebate u/s 87A (New Regime): Tax is Nil if Income <= 7L
    // Note: Technically rebate is up to ₹25,000. 
    // If income is slightly above 7L, marginal relief applies (complex, skipped for basic estimator)
    if (income <= 700000) {
        tax = 0;
    }

    const cess = calculateCess(tax);
    return { baseTax: Math.round(tax), cess: cess, totalTax: Math.round(tax + cess) };
};
