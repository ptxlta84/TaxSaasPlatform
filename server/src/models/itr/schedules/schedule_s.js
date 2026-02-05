const mongoose = require('mongoose');

/**
 * @schema ScheduleSalary
 * @description Maps to "Schedule S" (Income from Salaries)
 * @statute Sections 15, 16, 17 of Income-tax Act, 1961
 */
const scheduleSalarySchema = new mongoose.Schema({
    // Employer Details
    employerName: { type: String, required: true },
    employerType: { 
        type: String, 
        enum: ['CENTRAL_GOVT', 'STATE_GOVT', 'PSU', 'PENSIONERS', 'PRIV_SECTOR', 'OTHERS'],
        required: true 
    },
    employerTAN: { type: String, match: /^[A-Z]{4}\d{5}[A-Z]{1}$/ }, // Valid TAN format
    employerAddress: String,

    // Gross Salary (Section 17)
    grossSalary: {
        salarySection17_1: { type: Number, default: 0 }, // Basic + DA + HRA etc.
        perquisitesSection17_2: { type: Number, default: 0 }, // Value of perquisites
        profitsInLieuSection17_3: { type: Number, default: 0 } 
    },

    // Allowances Exempt u/s 10 (Breakup required for validation)
    exemptAllowances: {
         hra_10_13A: { type: Number, default: 0 }, // House Rent Allowance
         lta_10_5: { type: Number, default: 0 },   // Leave Travel Allowance
         gratuity_10_10: { type: Number, default: 0 },
         leaveEncashment_10_10AA: { type: Number, default: 0 },
         otherAllowances: { type: Number, default: 0 }
    },

    // Net Salary (Gross - Exemptions)
    netSalary: { type: Number, default: 0 },

    // Deductions u/s 16
    deductions: {
        standardDeduction_16ia: { type: Number, default: 50000 }, // Validation rule: Max 50k (75k for FY 25-26?)
        entertainmentAllowance_16ii: { type: Number, default: 0 }, // Govt employees only
        professionalTax_16iii: { type: Number, default: 0 }
    },

    // Chargeable Income
    incomeChargeableUnderSalaries: { type: Number, default: 0 }

}, { _id: false });

module.exports = scheduleSalarySchema;
