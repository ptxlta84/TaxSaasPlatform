// Capital Gains Calculator Utility with Indexation Support

// Cost Inflation Index (CII) Table (Base Year 2001-02 = 100)
// Updated for FY 2024-25 (AY 2025-26) - Estimated/Provisional for demo if not notified, usually known.
// Using known values up to FY 23-24 (348) and FY 24-25 (363 - provisional/example).
export const CII_TABLE = {
    '2001-02': 100, '2002-03': 105, '2003-04': 109, '2004-05': 113, '2005-06': 117,
    '2006-07': 122, '2007-08': 129, '2008-09': 137, '2009-10': 148, '2010-11': 167,
    '2011-12': 184, '2012-13': 200, '2013-14': 220, '2014-15': 240, '2015-16': 254,
    '2016-17': 264, '2017-18': 272, '2018-19': 280, '2019-20': 289, '2020-21': 301,
    '2021-22': 317, '2022-23': 331, '2023-24': 348, '2024-25': 363
};

export const ASSET_TYPES = {
    EQUITY_SHARES: { listing: 'listed', stcgRate: 15, ltcgRate: 10, periodMonths: 12, ltcgExemption: 100000, indexation: false },
    EQUITY_MF: { listing: 'listed', stcgRate: 15, ltcgRate: 10, periodMonths: 12, ltcgExemption: 100000, indexation: false },
    DEBT_MF: { listing: 'unlisted', stcgRate: 'slab', ltcgRate: 20, periodMonths: 36, indexation: true }, // Changed recently, but keeping classic logic for demo unless FY24 specific rule (Market Linked Debentures etc -> Short Term)
    // Note: Debt MF purchased after 1 April 2023 are STCG only. Handling complex rule might be needed.
    // For now, assuming traditional Debt logic for "older inputs" or "Property".
    REAL_ESTATE: { listing: 'unlisted', stcgRate: 'slab', ltcgRate: 20, periodMonths: 24, indexation: true },
    GOLD: { listing: 'unlisted', stcgRate: 'slab', ltcgRate: 20, periodMonths: 36, indexation: true },
    UNLISTED_SHARES: { listing: 'unlisted', stcgRate: 'slab', ltcgRate: 20, periodMonths: 24, indexation: true }, // Resident
};

/**
 * Calculates Capital Gain for a single asset transaction
 * @param {Object} asset 
 *   - type: key of ASSET_TYPES
 *   - buyDate: 'YYYY-MM-DD'
 *   - sellDate: 'YYYY-MM-DD'
 *   - buyPrice: Number
 *   - sellPrice: Number
 *   - transferExpenses: Number
 */
export const calculateSingleAssetGain = (asset) => {
    const rules = ASSET_TYPES[asset.type] || ASSET_TYPES.REAL_ESTATE; // Default to RE logic
    
    // 1. Determine Period of Holding
    const buy = new Date(asset.buyDate);
    const sell = new Date(asset.sellDate);
    const diffTime = Math.abs(sell - buy);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const isLTCG = diffDays > (rules.periodMonths * 30); // Approx
    
    // 2. Determine Cost of Acquisition (CoA)
    let CoA = Number(asset.buyPrice);
    
    // Indexation
    const buyYear = getFinancialYear(buy);
    const sellYear = getFinancialYear(sell);
    
    let indexedCoA = CoA;
    
    if (isLTCG && rules.indexation) {
        const ciiBuy = CII_TABLE[buyYear] || 100;
        const ciiSell = CII_TABLE[sellYear] || 363;
        indexedCoA = CoA * (ciiSell / ciiBuy);
    }
    
    // 3. Calculate Gain
    const expenses = Number(asset.transferExpenses || 0);
    const netSaleConsideration = Number(asset.sellPrice) - expenses;
    const gain = netSaleConsideration - indexedCoA;
    
    // 3.5 Section 54 / 54F Exemptions
    // Input Assumption: asset.exemptionSection ('54', '54F', '54EC') and asset.investmentAmount
    let exemptionAmount = 0;
    const investment = Math.min(Number(asset.investmentAmount || 0), 100000000); // 10 Cr Cap (Budget 2023)

    if (gain > 0 && isLTCG && investment > 0) {
        if (asset.exemptionSection === '54' && asset.type === 'REAL_ESTATE') {
            // Section 54: Reinvest Capital Gain from House Property
            // Exemption = Min(Capital Gain, Investment)
            exemptionAmount = Math.min(gain, investment); 
        } 
        else if (asset.exemptionSection === '54F' && asset.type !== 'REAL_ESTATE') {
             // Section 54F: Reinvest Net Consideration from Non-House Asset into House
             // Exemption = (Investment / NetConsideration) * Capital Gain
             const proportion = Math.min(1, investment / netSaleConsideration);
             exemptionAmount = gain * proportion;
        }
        else if (asset.exemptionSection === '54EC') {
            // Bonds (Max 50L)
            const bondCap = Math.min(investment, 5000000);
            exemptionAmount = Math.min(gain, bondCap);
        }
    }

    const taxableGain = Math.max(0, gain - exemptionAmount);
    
    // 4. Tax Estimation (per asset)
    let tax = 0;
    
    // Special Exemptions (Basic)
    if (taxableGain > 0) {
        if (isLTCG) {
             if (rules.ltcgExemption) {
                 const taxableAfterBasicExempt = Math.max(0, taxableGain - rules.ltcgExemption);
                 tax = taxableAfterBasicExempt * (rules.ltcgRate / 100);
             } else {
                 tax = taxableGain * (rules.ltcgRate / 100);
             }
        } else {
             if (rules.stcgRate === 'slab') {
                 // Taxed at marginal rate, handled in main aggregator
                 tax = 0; 
             } else {
                 tax = taxableGain * (rules.stcgRate / 100);
             }
        }
    }

    return {
        isLTCG,
        buyYear,
        sellYear,
        indexedCost: Math.round(indexedCoA),
        gain: Math.round(gain),
        exemption: Math.round(exemptionAmount),
        taxableGain: Math.round(taxableGain),
        tax: Math.round(tax),
        rate: isLTCG ? rules.ltcgRate : rules.stcgRate
    };
};

const getFinancialYear = (date) => {
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    // After March (2) -> year-(year+1), Before -> (year-1)-year
    if (month > 2) {
        return `${year}-${String(year + 1).slice(2)}`;
    } else {
        return `${year - 1}-${String(year).slice(2)}`;
    }
};
