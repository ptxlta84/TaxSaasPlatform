const { calculateTax } = require('../src/utils/taxCalculator');

describe('Tax Calculator Utility (FY 2024-25)', () => {
    
    // Test Case 1: Standard Middle Class Income
    it('calculates tax correctly for 12L income (Age 30)', () => {
        const incomeDetails = {
            grossTotalIncome: 1200000,
            deductions: { section80C: 0 }
        };
        const profile = { age: 30 };
        
        const result = calculateTax(incomeDetails, profile);
        
        // 1. Data Structure Check
        expect(result).toHaveProperty('oldRegime');
        expect(result).toHaveProperty('newRegime');
        expect(result).toHaveProperty('recommendation');

        // 2. New Regime Calculation Check
        // Gross: 12,00,000
        // Std Ded: 75,000 => Taxable: 11,25,000
        // Slabs:
        // 0-3L: 0
        // 3-7L (4L): 5% = 20,000
        // 7-10L (3L): 10% = 30,000
        // 10-11.25L (1.25L): 15% = 18,750
        // Total Base Tax: 68,750
        // Cess (4%): 2,750
        // Total: 71,500
        expect(result.newRegime.taxableIncome).toBe(1125000);
        expect(result.newRegime.taxPayable).toBe(71500);

        // 3. Old Regime Calculation Check
        // Gross: 12,00,000
        // Std Ded: 50,000 => Taxable: 11,50,000
        // Slabs:
        // 0-2.5L: 0
        // 2.5-5L: 5% = 12,500
        // 5-10L: 20% = 1,00,000
        // 10-11.5L: 30% = 45,000
        // Total Base Tax: 1,57,500
        // Cess: 6,300
        // Total: 1,63,800
        expect(result.oldRegime.taxableIncome).toBe(1150000);
        expect(result.oldRegime.taxPayable).toBe(163800);
        
        // Recommendation should be New Regime
        expect(result.recommendation).toBe('New Regime');
    });

    // Test Case 2: New Regime Rebate (Income slightly above 7L but within rebate after Std Ded)
    it('applies New Regime Rebate u/s 87A correctly (Income <= 7.75L)', () => {
        const incomeDetails = {
            grossTotalIncome: 775000, // 7.75L
            deductions: {}
        };
        const profile = { age: 25 };

        const result = calculateTax(incomeDetails, profile);

        // New Regime Taxable: 7.75L - 75k = 7.00L
        // Tax on 7L is normally 20k (3-7L @ 5%), but Rebate makes it 0
        expect(result.newRegime.taxableIncome).toBe(700000);
        expect(result.newRegime.taxPayable).toBe(0);
    });

    // Test Case 3: Old Regime Rebate
    it('applies Old Regime Rebate u/s 87A correctly (Income <= 5L Taxable)', () => {
        const incomeDetails = {
            grossTotalIncome: 550000, // 5.5L
            deductions: {}
        };
        const profile = { age: 25 };

        // Old Regime Taxable: 5.5L - 50k = 5.00L
        // Taxable 5L => Zero Tax (Rebate)
        const result = calculateTax(incomeDetails, profile);
        expect(result.oldRegime.taxableIncome).toBe(500000);
        expect(result.oldRegime.taxPayable).toBe(0);
    });

    // Test Case 4: Senior Citizen Benefits (Old Regime)
    it('applies Senior Citizen (60+) exemption limit in Old Regime', () => {
        const incomeDetails = {
            grossTotalIncome: 350000, // 3.5L
            deductions: {}
        };
        const profile = { age: 65 }; // Senior

        // Std Ded: 50k => Taxable 3L
        // Regular Limit is 2.5L (would pay tax on 50k)
        // Senior Limit is 3.0L (pays 0)
        const result = calculateTax(incomeDetails, profile);
        expect(result.oldRegime.taxableIncome).toBe(300000);
        expect(result.oldRegime.taxPayable).toBe(0);
    });

    // Test Case 5: Old Regime Better (High Deductions)
    it('recommends Old Regime when deductions are high', () => {
        const incomeDetails = {
            grossTotalIncome: 1500000, // 15L
            deductions: {
                section80C: 150000, // 1.5L
                section80D: 50000,  // 50k
                hra: 300000,        // 3L (Big Driver)
                other: 50000        // 50k (NPS etc)
            } 
        };
        // Total Ded (Old): 1.5 + 0.5 + 3.0 + 0.5 + 0.5(Std) = 6.0L
        // Old Taxable: 9.0L
        // Old Tax: (2.5L*5% + 4L*20%) + Cess = (12500 + 80000)*1.04 = 96,200
        
        // New Taxable: 15L - 75k = 14.25L
        // New Tax: (4L*5% + 3L*10% + 2L*15% + 3L*20% + 2.25L*30%) -> approx 1.5L+
        
        const profile = { age: 40 };
        const result = calculateTax(incomeDetails, profile);
        
        expect(result.recommendation).toBe('Old Regime');
        expect(result.oldRegime.taxPayable).toBeLessThan(result.newRegime.taxPayable);
    });

});
