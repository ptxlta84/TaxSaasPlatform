const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const incomeTaxReturnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  financialYear: {
    type: String,
    required: true,
    default: '2024-2025'
  },
  itrForm: {
      type: String,
      enum: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'],
      default: 'ITR-1'
  },
  status: {
    type: String,
    enum: ['draft', 'saved', 'calculated', 'submitted', 'verified', 'filed'],
    default: 'draft'
  },
  
  // Step 2: Income Details
  income: {
    salary: { 
        gross: { type: Number, default: 0 },
        net: { type: Number, default: 0 }
    },
    houseProperty: { type: Number, default: 0 },
    capitalGains: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    otherSources: { type: Number, default: 0 },
    exemptIncome: { type: Number, default: 0 }
  },

  // Step 3: Deductions
  // Schedule HP: Income from House Property
  houseProperties: [{
    address: String,
    ownershipPercentage: { type: Number, default: 100 },
    propertyType: { 
      type: String, 
      enum: ['self_occupied', 'let_out', 'deemed_let_out'],
      default: 'self_occupied'
    },
    municipalValue: { type: Number, default: 0 },
    actualRent: { type: Number, default: 0 },
    municipalTaxesPaid: { type: Number, default: 0 },
    interestOnLoan: { type: Number, default: 0 },
    preConstructionInterest: { type: Number, default: 0 },
    coOwners: [{
      name: String,
      pan: String,
      percentage: Number
    }],
    calculation: {
      grossAnnualValue: Number,
      netAnnualValue: Number,
      standardDeduction: Number, // 30% of NAV
      taxableIncome: Number
    }
  }],

  // Total Income from House Property (Computed)
  totalIncomeHouseProperty: { type: Number, default: 0 },

  // Schedule FA: Foreign Assets & Income
  foreignAssets: [{
    category: {
      type: String,
      enum: ['bank_account', 'securities', 'real_estate', 'mutual_funds', 'insurance', 'business', 'other']
    },
    country: String,
    description: String,
    valueInForeignCurrency: Number,
    currency: { type: String, default: 'USD' },
    valueInINR: Number,
    incomeFromAsset: Number,
    foreignTaxPaid: Number,
    tin: String, // Tax Identification Number
    isReportedUnderFATCA: { type: Boolean, default: false },
    isReportedUnderCRS: { type: Boolean, default: false }
  }],

  foreignIncome: [{
    incomeType: {
      type: String,
      enum: ['dividend', 'interest', 'capital_gains', 'rental', 'business', 'other']
    },
    country: String,
    amountInForeignCurrency: Number,
    amountInINR: Number,
    foreignTaxPaid: Number,
    dtaaBenefitClaimed: { type: Boolean, default: false },
    taxCreditAvailable: Number
  }],

  deductions: {
    section80C: { type: Number, default: 0 },
    section80D: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    section80G: { type: Number, default: 0 },
    section80E: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    standardDeduction: { type: Number, default: 50000 }
  },

  // Regime Selection
  regime: { 
      type: String, 
      enum: ['old', 'new'], 
      default: 'new' 
  },

  // Step 4: Tax Calculation Results
  computation: {
    taxableIncome: { type: Number, default: 0 },
    taxPayable: { type: Number, default: 0 },
    surcharge: { type: Number, default: 0 },
    cess: { type: Number, default: 0 },
    totalTaxLiability: { type: Number, default: 0 },
    tdsCredit: { type: Number, default: 0 }, // From Form 16
    refundDue: { type: Number, default: 0 },
    amountPayable: { type: Number, default: 0 }
  },

  // Step 5: Bank Details
  bankDetails: {
      accountNumber: { 
          type: String, 
          set: encrypt, 
          get: decrypt 
      },
      ifscCode: String,
      bankName: String,
      isPrimaryInfo: { type: Boolean, default: true }
  },

  // Payment Info
  paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
  },
  paymentPlan: {
      type: String,
      enum: ['basic', 'professional', 'business'],
      default: 'basic'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

  // Filing Metadata
  acknowledgementNumber: String,
  filedAt: Date,
  verifiedAt: Date,
  
}, {
  timestamps: true,
  toJSON: { getters: true }
});

const IncomeTaxReturn = mongoose.model('IncomeTaxReturn', incomeTaxReturnSchema);

module.exports = IncomeTaxReturn;
