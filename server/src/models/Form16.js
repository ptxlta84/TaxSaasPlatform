const mongoose = require('mongoose');

const form16Schema = new mongoose.Schema({
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
  employer: {
    name: { type: String, required: true },
    tan: { type: String, required: true },
    address: { type: String }
  },
  salary: {
    gross: { type: Number, required: true, default: 0 },
    hra: { type: Number, default: 0 },
    lta: { type: Number, default: 0 },
    standardDeduction: { type: Number, default: 50000 },
    professionalTax: { type: Number, default: 0 },
    netTaxable: { type: Number, required: true, default: 0 }
  },
  tds: {
    totalamount: { type: Number, default: 0 },
    taxDeducted: { type: Number, required: true, default: 0 }
  },
  originalFileName: { type: String },
  fileUrl: { type: String }, // Path to stored file
  extractedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Form16 = mongoose.model('Form16', form16Schema);

module.exports = Form16;
