const mongoose = require('mongoose');

/**
 * @schema ScheduleVIA
 * @description Maps to "Schedule VI-A" (Deductions)
 * @statute Chapter VI-A of Income-tax Act, 1961
 */
const scheduleVIASchema = new mongoose.Schema({
    
    // Part A: Section 80C, 80CCC, 80CCD
    partA_80C: {
        section80C: { type: Number, default: 0 }, // LIC, PPF, PF, Housing Loan Principal (Max 1.5L aggregate)
        section80CCC: { type: Number, default: 0 }, // Pension Fund
        section80CCD1: { type: Number, default: 0 }, // NPS (Employee)
        section80CCD1B: { type: Number, default: 0 }, // NPS (Additional 50k)
        section80CCD2: { type: Number, default: 0 }  // NPS (Employer Contribution - 10%/14%)
    },

    // Part B: Section 80D (Health Insurance)
    partB_80D: {
        selfAndFamily: {
             healthInsurancePremium: { type: Number, default: 0 },
             preventiveHealthCheckup: { type: Number, default: 0 }, // Max 5000
             medicalExpenditure: { type: Number, default: 0 }, // Senior Citizens only
             isSeniorCitizen: { type: Boolean, default: false }
        },
        parents: {
             healthInsurancePremium: { type: Number, default: 0 },
             preventiveHealthCheckup: { type: Number, default: 0 },
             medicalExpenditure: { type: Number, default: 0 },
             isSeniorCitizen: { type: Boolean, default: false }
        }
    },

    // Part C: Other Deductions
    partC_Other: {
        section80E: { type: Number, default: 0 }, // Education Loan Interest
        section80EEA: { type: Number, default: 0 }, // Affordable Housing Interest
        section80G: { type: Number, default: 0 }, // Donations (Requires separate detailed schedule if > 0)
        section80GG: { type: Number, default: 0 }, // Rent Paid (if no HRA)
        section80U: { type: Number, default: 0 }   // Disability
    },

    // Part CA: Savings Interest
    partCA_Interest: {
        section80TTA: { type: Number, default: 0 }, // Max 10k (Not for Seniors)
        section80TTB: { type: Number, default: 0 }  // Max 50k (For Seniors)
    },

    // Total Deductions
    totalDeductionsVI_A: { type: Number, default: 0 }

}, { _id: false });

module.exports = scheduleVIASchema;
