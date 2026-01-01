export const calculateITR2Tax = (formData) => {
    // 0. Extract Personal Context
    const age = Number(formData.personalDetails?.age || 35);
    const isSenior = age >= 60 && age < 80;
    const isSuperSenior = age >= 80;

    // 1. Aggregation of Income
    const salary = Number(formData.income?.salary?.grossSalary || 0); 
    
    // Standard Deduction Logic
    const standardDeduction = 50000; // FY 24-25
    
    // Net Salary is calculated during taxable income phase usually, but for aggregation display:
    
    const houseProperty = (formData.income?.houseProperty || []).reduce((acc, hp) => acc + Number(hp.netIncome || 0), 0);
    const capitalGains = Number(formData.income?.capitalGains?.total || 0); 
    const otherSources = Number(formData.income?.otherSources?.total || 0);
    const interestIncome = Number(formData.income?.otherSources?.interest || 0); 

    const grossTotalIncome = salary + houseProperty + capitalGains + otherSources;

    // 2. Prepare Deductions (Old Regime)
    const deductionsInput = formData.deductions || {};
    
    // 80C
    const d80C = Math.min(Number(deductionsInput.section80C?.total || 0), 150000);
    
    // 80D (Health Insurance)
    const limit80D = isSenior ? 50000 : 25000;
    const d80D = Math.min(Number(deductionsInput.section80D?.total || 0), limit80D);

    // 80TTB (Senior Interest) vs 80TTA (Normal Interest)
    let d80TT = 0;
    if (isSenior || isSuperSenior) {
        d80TT = Math.min(interestIncome, 50000); 
    } else {
        d80TT = Math.min(interestIncome, 10000);
    }
    if (deductionsInput.section80TTB) d80TT = Number(deductionsInput.section80TTB);

    const totalDeductionsOld = d80C + d80D + d80TT; // + others if present

    // 3. Taxable Income Calculation
    const taxableOld = Math.max(0, grossTotalIncome - standardDeduction - totalDeductionsOld);
    const taxableNew = Math.max(0, grossTotalIncome - standardDeduction);

    // 4. Calculate Tax
    const taxOld = calculateOldRegimeTax(taxableOld, age);
    const taxNew = calculateNewRegimeTax(taxableNew); 

    // 5. Comparison
    const regime = taxNew.totalTax <= taxOld.totalTax ? 'NEW' : 'OLD';
    const savings = Math.abs(taxOld.totalTax - taxNew.totalTax);

    return {
        income: {
            gross: grossTotalIncome,
            houseProperty,
            capitalGains,
            otherSources
        },
        oldRegime: {
            taxableIncome: taxableOld,
            tax: taxOld.tax,
            cess: taxOld.cess,
            totalTax: taxOld.totalTax,
            deductions: {
                total: totalDeductionsOld + standardDeduction,
                breakdown: { 
                    '80C': d80C, 
                    '80D': d80D, 
                    '80TTB/TTA': d80TT,
                    'Standard Deduction': standardDeduction 
                }
            }
        },
        newRegime: {
            taxableIncome: taxableNew,
            tax: taxNew.tax,
            cess: taxNew.cess,
            totalTax: taxNew.totalTax,
            deductions: {
                total: standardDeduction,
                breakdown: { 'Standard Deduction': standardDeduction }
            }
        },
        recommendation: {
            bestRegime: regime,
            savings: savings,
            message: regime === 'NEW' 
                ? `New Regime saves you ₹${savings.toLocaleString()}.` 
                : `Old Regime saves you ₹${savings.toLocaleString()} primarily due to your deductions.`
        },
        final: {
             payable: regime === 'NEW' ? taxNew.totalTax : taxOld.totalTax
        }
    };
};

const calculateNewRegimeTax = (income) => {
    // FY 2024-25 Slabs
    let tax = 0;
    if (income <= 300000) tax = 0;
    else if (income <= 700000) tax = (income - 300000) * 0.05;
    else if (income <= 1000000) tax = 20000 + (income - 700000) * 0.10; // 3-7 (5% of 4L = 20k)
    else if (income <= 1200000) tax = 50000 + (income - 1000000) * 0.15; // 20k + 7-10 (10% of 3L = 30k) = 50k
    else if (income <= 1500000) tax = 80000 + (income - 1200000) * 0.20; // 50k + 10-12 (15% of 2L = 30k) = 80k -> Wait, 10-12 is 15%? Yes. 
    // Let's re-verify slabs: 
    // 0-3 Nil
    // 3-7 5%
    // 7-10 10%
    // 10-12 15%
    // 12-15 20%
    // >15 30%
    else tax = 140000 + (income - 1500000) * 0.30; 

    // Rebate 87A (New): Income <= 7L -> Tax Nil
    if (income <= 700000) tax = 0;

    const cess = tax * 0.04;
    return { tax, cess, totalTax: tax + cess };
};

const calculateOldRegimeTax = (income, age) => {
    let tax = 0;
    
    // Basic Limit by Age
    let limit = 250000; 
    if (age >= 60 && age < 80) limit = 300000;
    if (age >= 80) limit = 500000;

    if (income <= limit) {
        tax = 0;
    } else if (income <= 500000) {
        tax = (income - limit) * 0.05;
    } else if (income <= 1000000) {
        let taxUpTo5L = 0;
        if (limit < 500000) taxUpTo5L = (500000 - limit) * 0.05;
        
        tax = taxUpTo5L + (income - 500000) * 0.20;
    } else {
        let taxUpTo5L = 0;
        if (limit < 500000) taxUpTo5L = (500000 - limit) * 0.05;
         
        let tax5Lto10L = 100000; // (10L-5L)*20%
        
        tax = taxUpTo5L + tax5Lto10L + (income - 1000000) * 0.30;
    }

    // Rebate 87A (Old): Income <= 5L -> Tax Nil
    if (income <= 500000) tax = 0;

    const cess = tax * 0.04;
    return { tax, cess, totalTax: tax + cess };
};
