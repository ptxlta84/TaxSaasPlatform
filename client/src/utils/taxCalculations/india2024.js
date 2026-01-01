/**
 * India Tax Calculations (FY 2024-25 | AY 2025-26)
 * Handles Old vs New Regime Logic
 */

// Core calculation function (Pure calculation, no recommendations)
const calculateTaxCore = (input) => {
  const { regime, income, age } = input;
  
  // Tax slabs for FY 2024-25
  const slabs = {
    old: {
      '<60': [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]],
      '60-80': [[300000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]],
      '>80': [[500000, 0], [1000000, 0.2], [Infinity, 0.3]]
    },
    new: {
      '<60': [[300000, 0], [600000, 0.05], [900000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]],
      '60-80': [[300000, 0], [600000, 0.05], [900000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]],
      '>80': [[300000, 0], [600000, 0.05], [900000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]]
    }
  };

  // Calculate taxable income
  let taxableIncome = income;
  
  if (regime === 'old') {
    const totalDeductions = 
      Math.min(input.section80C || 0, 150000) +
      (input.section80D || 0) +
      (input.hra || 0) +
      (input.standardDeduction || 50000) +
      (input.housePropertyLoss || 0);
    
    taxableIncome = Math.max(0, income - totalDeductions);
  } else {
    // New Regime: Standard Deduction of 50k (FY 23-24 onwards)
    // Assuming standard deduction applies to new regime as per recent updates for salaried
    // But sticking to simplified logic: effectively New Regime usually has fewer deductions.
    const stdDed = input.standardDeduction || 50000;
    // Note: For strict 2024 rules, Std Deduction IS allowed in New Regime.
    // We will apply it if user provided it, assuming they are salaried.
    taxableIncome = Math.max(0, income - stdDed);
  }

  // Calculate tax based on slabs
  let tax = 0;
  const applicableSlabs = slabs[regime][age] || slabs[regime]['<60']; // Fallback
  let previousLimit = 0;

  for (const [limit, rate] of applicableSlabs) {
    if (taxableIncome > previousLimit) {
      const ceiling = limit === Infinity ? taxableIncome : limit;
      const taxableInSlab = Math.min(taxableIncome, ceiling) - previousLimit;
      
      if (taxableInSlab > 0) {
        tax += taxableInSlab * rate;
      }
      
      previousLimit = limit;
    }
  }

  // Rebate under Section 87A
  if (regime === 'new' && taxableIncome <= 700000) {
    tax = 0;
  } else if (regime === 'old' && taxableIncome <= 500000) {
    tax = Math.max(0, tax - 12500);
  }

  // Health & Education Cess (4%)
  const cess = tax * 0.04;
  
  // Surcharge (simplified)
  let surcharge = 0;
  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    surcharge = tax * 0.10;
  } else if (taxableIncome > 10000000) {
    surcharge = tax * 0.15;
  }

  const totalTax = tax + cess + surcharge;

  return {
    taxableIncome: Math.round(taxableIncome),
    tax: Math.round(tax),
    cess: Math.round(cess),
    surcharge: Math.round(surcharge),
    totalTax: Math.round(totalTax)
  };
};

const getRegimeRecommendation = (input) => {
  const oldRegimeResult = calculateTaxCore({ ...input, regime: 'old' });
  const newRegimeResult = calculateTaxCore({ ...input, regime: 'new' });
  
  const savings = oldRegimeResult.totalTax - newRegimeResult.totalTax;
  
  if (savings > 0) {
    return {
      regime: 'new',
      message: `New Regime is better. You save ₹${Math.round(Math.abs(savings)).toLocaleString('en-IN')}`,
      savings: Math.round(Math.abs(savings))
    };
  } else if (savings < 0) {
    return {
      regime: 'old',
      message: `Old Regime is better. You save ₹${Math.round(Math.abs(savings)).toLocaleString('en-IN')}`,
      savings: Math.round(Math.abs(savings))
    };
  } else {
    return {
      regime: 'similar',
      message: 'Both regimes are equal.',
      savings: 0
    };
  }
};

// Main Exported Function
export const calculateIncomeTax = (input) => {
  const coreResult = calculateTaxCore(input);
  const recommendation = getRegimeRecommendation(input);

  return {
    ...coreResult,
    regimeRecommendation: recommendation
  };
};
