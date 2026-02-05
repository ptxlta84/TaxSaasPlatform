const mongoose = require('mongoose');

/**
 * @schema ScheduleOS
 * @description Maps to "Schedule OS" (Income from Other Sources)
 * @statute Sections 56 to 59
 */
const scheduleOSSchema = new mongoose.Schema({
    
    // 1. Gross Income Streams
    interestGross: {
        savingsBank_10_15: { type: Number, default: 0 },
        deposits_10_15: { type: Number, default: 0 }, // FD/RD
        incomeTaxRefundInterest: { type: Number, default: 0 },
        passThroughIncome: { type: Number, default: 0 }
    },
    
    dividendGross: {
        chargesDeducted: Number, // Usually not allowed as deduction except interest
        netDividend: { type: Number, default: 0 } 
    },

    casualIncome: {
        winningsLotteryPuzzle: { type: Number, default: 0 }, // Flat 30% tax
        winningsOnlineGames: { type: Number, default: 0 }    // Section 115BBJ
    },

    familyPension: {
         grossAmount: { type: Number, default: 0 },
         deduction_57iia: { type: Number, default: 0 } // Lower of 1/3rd or 15,000 (Check Finance Act updates)
    },

    anyOtherIncome: { type: Number, default: 0 },

    // 2. Deductions u/s 57
    deductions: {
        expensesForDividend: { type: Number, default: 0 }, // Only Interest exp allowed up to 20%
        otherDeductions: { type: Number, default: 0 }
    },
    
    // 3. Quarterly Breakup for Dividend (Section 234C)
    dividendIncomeQuarterly: {
        upto15Jun: Number,
        upto15Sep: Number,
        upto15Dec: Number,
        upto15Mar: Number,
        upto31Mar: Number
    },
    
    // Final Income
    incomeFromOtherSources: {
        chargeableAtNormalRates: { type: Number, default: 0 },
        chargeableAtSpecialRates: { type: Number, default: 0 } // Lottery, etc.
    }

}, { _id: false });

module.exports = scheduleOSSchema;
