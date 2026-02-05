const mongoose = require('mongoose');

/**
 * @schema ScheduleIT
 * @description Maps to "Schedule IT" (Taxes Paid) & "Schedule TDS"
 * @statute Sections 192-219
 */
const scheduleITSchema = new mongoose.Schema({
    
    // 1. Advance Tax and Self Assessment Tax (Schedule IT)
    advanceTaxDetails: [{
        bsrCode: { type: String, required: true, match: /^\d{7}$/ },
        dateOfDeposit: { type: Date, required: true },
        challanSerialNo: { type: String, required: true },
        amount: { type: Number, required: true }
    }],

    // 2. TDS from Salary (Form 16) (Schedule TDS1)
    tdsSalaryDetails: [{
        tanOfDeductor: { type: String, required: true, match: /^[A-Z]{4}\d{5}[A-Z]{1}$/ },
        nameOfDeductor: String,
        incomeChargeable: Number,
        totalTaxDeducted: Number
    }],

    // 3. TDS from Other than Salary (Form 16A) (Schedule TDS2)
    tdsOtherDetails: [{
        tanOfDeductor: { type: String, required: true, match: /^[A-Z]{4}\d{5}[A-Z]{1}$/ },
        nameOfDeductor: String,
        amountPaidCredited: Number, // Gross Amount
        yearOfDeduction: String,
        taxDeductedResultingInRefund: Number, // TDS Claimed this year
    }],
    
    // 4. TCS Details (Schedule TCS)
    tcsDetails: [{
        tanOfCollector: String,
        nameOfCollector: String,
        amountPaidDebited: Number,
        taxCollected: Number,
        taxCollectedClaimed: Number
    }],

    // Aggregates
    totals: {
        totalAdvanceTax: { type: Number, default: 0 },
        totalSelfAssessmentTax: { type: Number, default: 0 },
        totalTDS: { type: Number, default: 0 },
        totalTCS: { type: Number, default: 0 }
    }

}, { _id: false });

module.exports = scheduleITSchema;
