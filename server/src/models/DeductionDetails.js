const mongoose = require('mongoose');

const deductionDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  financialYear: {
    type: String,
    default: '2024-2025'
  },
  section80C: {
    ppf: { type: Number, default: 0 },
    epf: { type: Number, default: 0 },
    elss: { type: Number, default: 0 },
    lic: { type: Number, default: 0 },
    tuitionFees: { type: Number, default: 0 },
    homeLoanPrincipal: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 } // Max 1.5L limit will be applied in logic/display, but we store actual total here
  },
  section80D: {
    self: { type: Number, default: 0 }, // Self, Spouse, Children
    parents: { type: Number, default: 0 }, // Parents
    preventiveCheckup: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  otherDeductions: {
    section80G: { type: Number, default: 0 }, // Donations
    section80TTA: { type: Number, default: 0 }, // Savings Interest (Max 10k)
    section80TTB: { type: Number, default: 0 }, // Senior Citizens Interest (Max 50k)
    section80E: { type: Number, default: 0 }, // Education Loan Interest
    section24b: { type: Number, default: 0 }, // Home Loan Interest (Self Occupied) - Usually part of House Property, but tracking here for complete view? No, keep in House Property.
    total: { type: Number, default: 0 }
  },
  grossTotalDeductions: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to calculate totals
deductionDetailsSchema.pre('save', function(next) {
  // 80C
  this.section80C.total = (this.section80C.ppf || 0) + 
                          (this.section80C.epf || 0) + 
                          (this.section80C.elss || 0) + 
                          (this.section80C.lic || 0) + 
                          (this.section80C.tuitionFees || 0) + 
                          (this.section80C.homeLoanPrincipal || 0) + 
                          (this.section80C.other || 0);

  // 80D
  this.section80D.total = (this.section80D.self || 0) + 
                          (this.section80D.parents || 0) + 
                          (this.section80D.preventiveCheckup || 0);

  // Other
  this.otherDeductions.total = (this.otherDeductions.section80G || 0) + 
                               (this.otherDeductions.section80TTA || 0) + 
                               (this.otherDeductions.section80TTB || 0) + 
                               (this.otherDeductions.section80E || 0);

  // Gross Total
  this.grossTotalDeductions = this.section80C.total + 
                              this.section80D.total + 
                              this.otherDeductions.total;
  
  next();
});

module.exports = mongoose.model('DeductionDetails', deductionDetailsSchema);
