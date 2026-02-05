const mongoose = require('mongoose');
const Constants = require('./constants');
const PartAGeneralSchema = require('./schedules/partA_general');

/**
 * @model IncomeTaxReturn (ICDM 2.0)
 * @description Master Validator & Aggregator for ITR Compliance
 * @statute Income-tax Act, 1961
 */
const incomeTaxReturnSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Audit Trail (Hash Chaining Reference)
    auditLogRef: { type: String }, // SHA-256 Hash of latest audit entry

    // Statutory Metadata
    assessmentYear: { type: String, required: true, default: '2025-26' },
    financialYear: { type: String, required: true, default: '2024-25' },
    
    itrFormType: {
        type: String,
        enum: Constants.ITR_FORMS,
        required: true
    },

    // Part A: General Information (Embedded)
    partA_General: {
        type: PartAGeneralSchema,
        required: true
    },

    // Schedules (Part B - TI)
    scheduleSalary: {
        type: [require('./schedules/schedule_s')], // Array to support multiple employers
        default: []
    },
    scheduleHP: {
        type: [require('./schedules/schedule_hp')], // Array to support multiple properties
        default: []
    },
    scheduleCG: { 
        type: require('./schedules/schedule_cg'),
        default: {}
    },
    scheduleOS: {
        type: require('./schedules/schedule_os'),
        default: {}
    },
    // Part C - Deductions
    scheduleVIA: {
        type: require('./schedules/schedule_via'),
        default: {}
    },
    // Part D - Taxes Paid
    scheduleIT: {
         type: require('./schedules/schedule_it'),
         default: {}
    },
    
    // Status Tracking
    status: {
        type: String,
        enum: Constants.ITR_STATUS,
        default: 'DRAFT'
    },
    
    // Computation Results (Snapshot)
    computationSnapshot: {
        taxableIncome: Number,
        taxPayable: Number,
        interestSections: {
            '234A': { type: Number, default: 0 },
            '234B': { type: Number, default: 0 },
            '234C': { type: Number, default: 0 }
        }
    },

    // Verification
    verification: {
        verifiedBy: String, // Name
        capacity: String,   // Self/Karta/MD
        place: String,
        date: { type: Date, default: Date.now },
        ipAddress: String
    }

}, {
    timestamps: true,
    collection: 'income_tax_returns_v2' // Separate collection for V2
});

// Indexes for High-Performance Querying
incomeTaxReturnSchema.index({ 'partA_General.pan': 1, assessmentYear: 1 }, { unique: true });

const IncomeTaxReturnV2 = mongoose.model('IncomeTaxReturnV2', incomeTaxReturnSchema);
module.exports = IncomeTaxReturnV2;
