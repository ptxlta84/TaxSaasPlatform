const mongoose = require('mongoose');

const incomeDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One set of income details per user for current active year
  },
  financialYear: {
    type: String,
    default: '2024-2025'
  },
  form16Stage: {
    type: String,
    enum: ['NONE', 'PART_A_UPLOADED', 'PART_A_PARSED', 'PART_B_UPLOADED', 'PART_B_PARSED', 'CONSOLIDATED'],
    default: 'NONE'
  },
  employer: {
    name: { type: String, default: '' },
    tan: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  salary: {
    grossSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 }, // HRA, LTA etc.
    netSalary: { type: Number, default: 0 }
  },
  houseProperty: {
    type: { type: String, enum: ['self', 'let-out'], default: 'self' },
    incomeFromRent: { type: Number, default: 0 },
    municipalTaxes: { type: Number, default: 0 },
    interestOnLoan: { type: Number, default: 0 }, // Max 2L for self-occupied
    netIncome: { type: Number, default: 0 }
  },
  business: {
    grossTurnover: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 }, // Or presumptive income
    expenses: { type: Number, default: 0 }
  },
  capitalGains: {
    shortTerm: { type: Number, default: 0 }, // STCG
    longTerm: { type: Number, default: 0 }   // LTCG
  },
  otherSources: {
    savingsInterest: { type: Number, default: 0 },
    fdInterest: { type: Number, default: 0 },
    dividend: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  // Auto-calculated fields
  grossTotalIncome: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to calculate totals
incomeDetailsSchema.pre('save', function(next) {
  // Recalculate component totals first
  this.salary.netSalary = Math.max(0, this.salary.grossSalary - this.salary.allowances);
  
  // House Property Logic (Net = Rent - Taxes - 30% Std Ded - Interest)
  if (this.houseProperty.type === 'let-out') {
     const nav = Math.max(0, this.houseProperty.incomeFromRent - this.houseProperty.municipalTaxes);
     const stdDed = nav * 0.3;
     this.houseProperty.netIncome = nav - stdDed - this.houseProperty.interestOnLoan;
  } else {
     // Self occupied: Loss up to 2L
     this.houseProperty.netIncome = Math.max(-200000, -1 * this.houseProperty.interestOnLoan);
  }

  this.otherSources.total = (this.otherSources.savingsInterest || 0) + 
                            (this.otherSources.fdInterest || 0) + 
                            (this.otherSources.dividend || 0) + 
                            (this.otherSources.other || 0);

  // Total Gross Income
  this.grossTotalIncome = this.salary.netSalary + 
                          this.houseProperty.netIncome + 
                          this.business.netProfit + 
                          (this.capitalGains.shortTerm + this.capitalGains.longTerm) + 
                          this.otherSources.total;
  
  next();
});

module.exports = mongoose.model('IncomeDetails', incomeDetailsSchema);
