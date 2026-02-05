import { calculateITR2Tax } from '../utils/taxCalculatorITR2';
import { calculateSingleAssetGain, ASSET_TYPES } from '../utils/capitalGainsCalculator';

export const RUN_VALIDATION = () => {
    const results = [];
    
    // --- SUITE 1: Senior Citizen ---
    const scenario1 = {
        id: 'SC-01',
        title: 'Senior Citizen (65) Pension + Interest',
        formData: {
            personalDetails: { age: 65, grossSalary: 600000 },
            income: { salary: { grossSalary: 600000 }, otherSources: { total: 300000, interest: 300000 } },
            deductions: { section80C: { total: 150000 }, section80D: { total: 50000 }, section80TTB: 50000 } // Pass explicit amount for test
        },
        expected: {
            oldTax: 31200,
            bestRegime: 'OLD' // Old gives better owing to 80TTB+Slabs
        }
    };
    results.push(testScenario(scenario1, 'SeniorCitizen'));

    // --- SUITE 2: Capital Gains (Equity) ---
    // Buy: 5L, Sell: 8L, Hold: 18m (>12m) -> LTCG
    // Gain: 3L. Exempt: 1L. Taxable: 2L. Tax @ 10%: 20k. Cess: 800. Total: 20800.
    const cg1 = calculateSingleAssetGain({
        type: 'EQUITY_SHARES',
        buyDate: '2022-01-01',
        sellDate: '2023-08-01', // >12m
        buyPrice: 500000,
        sellPrice: 800000,
        transferExpenses: 0
    });
    
    const scenario2 = {
        id: 'CG-01',
        title: 'Equity LTCG with ₹1L Exemption',
        type: 'unit', // Unit test for calculator only
        actual: { 
            gain: cg1.gain, 
            taxable: cg1.taxableGain, 
            tax: cg1.tax 
        },
        expected: {
            gain: 300000,
            taxable: 200000,
            tax: 20000
        }
    };
    results.push(testResultInternal(scenario2, 'CapitalGains'));

    // --- SUITE 3: Real Estate Indexation ---
    // Buy 2018 (CII: 280), Sell 2024 (CII: 363)
    // Cost: 50L. Indexed: 50 * (363/280) = 64.82L (approx)
    // Sell: 1Cr. Gain: 35.17L. Tax @ 20%
    const cg2 = calculateSingleAssetGain({
        type: 'REAL_ESTATE',
        buyDate: '2018-05-01',
        sellDate: '2024-06-01',
        buyPrice: 5000000,
        sellPrice: 10000000
    });

    const expectedIndexed = Math.round(5000000 * (363/280));
    const expectedGain = 10000000 - expectedIndexed;
    const expectedTax = Math.round(expectedGain * 0.20);

    const scenario3 = {
        id: 'CG-02',
        title: 'Real Estate with Indexation',
        type: 'unit',
        actual: {
            indexedCost: cg2.indexedCost,
            tax: cg2.tax
        },
        expected: {
            indexedCost: expectedIndexed,
            tax: expectedTax
        }
    };
    results.push(testResultInternal(scenario3, 'CapitalGains'));

    // --- SUITE 4: Section 54 Exemption ---
    // Sell House -> Gain 50L. Reinvest 40L.
    // Taxable Gain = 50L - 40L = 10L.
    // Tax @ 20% = 2L.
    // --- SUITE 4: Section 54 Exemption ---
    // Sell House -> Gain 50L. Reinvest 40L.
    // Taxable Gain = 50L - 40L = 10L.
    // Tax @ 20% = 2L.
    // Calculate partial taxable case directly.
    
    // Manual Check:
    // Buy 2010 (CII: 167), Sell 2024 (CII: 363)
    // Cost: 20L. Indexed: 20L * (363/167) = 43,47,305
    // Gain: 1Cr - 43.47L = 56,52,695
    // Invest: 60L.
    // Exemption: Min(56.52L, 60L) = 56.52L (Full Exempt)
    // Tax should be 0.
    
    // Let's create a partial taxable case.
    // Invest 40L. Exemption 40L. Taxable 16.52L.
    const cg4 = calculateSingleAssetGain({
        type: 'REAL_ESTATE',
        buyDate: '2010-04-01', 
        sellDate: '2024-05-01',
        buyPrice: 2000000, 
        sellPrice: 10000000, 
        exemptionSection: '54',
        investmentAmount: 4000000 
    });

    const expectedIndexed4 = Math.round(2000000 * (363/167));
    const expectedGain4 = 10000000 - expectedIndexed4;
    const expectedTaxable4 = expectedGain4 - 4000000;
    const expectedTax4 = Math.round(expectedTaxable4 * 0.20); // 20% of remaining

    const scenario4 = {
        id: 'CG-03',
        title: 'Section 54 Partial Exemption',
        type: 'unit',
        actual: {
            gain: cg4.gain,
            exemption: cg4.exemption,
            tax: cg4.tax
        },
        expected: {
            gain: expectedGain4,
            exemption: 4000000,
            tax: expectedTax4
        }
    };
    results.push(testResultInternal(scenario4, 'CapitalGains'));

    return results;
};

const testResultInternal = (scenario, suite) => {
    let passed = true;
    Object.keys(scenario.expected).forEach(key => {
        if (Math.abs(scenario.actual[key] - scenario.expected[key]) > 100) passed = false;
    });
    return { ...scenario, passed, suite };
};

const testScenario = (scenario, suite) => {
    const output = calculateITR2Tax(scenario.formData);
    
    // Normalize checks
    const checks = [];
    if (scenario.expected.oldTax !== undefined) {
        checks.push(Math.abs(output.oldRegime.totalTax - scenario.expected.oldTax) < 100);
    }
    if (scenario.expected.bestRegime !== undefined) {
        checks.push(output.recommendation.bestRegime === scenario.expected.bestRegime);
    }

    const passed = checks.every(c => c);

    return {
        ...scenario,
        actual: { 
            oldTax: output.oldRegime?.totalTax, 
            newTax: output.newRegime?.totalTax 
        },
        passed,
        suite
    };
};
