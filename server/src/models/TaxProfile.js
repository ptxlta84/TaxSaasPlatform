const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true, required: true },
  state: { type: String, trim: true, required: true },
  pincode: { 
    type: String, 
    required: true, 
    match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Pincode'] 
  },
  country: { type: String, default: 'India' }
}, { _id: false });

const taxProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensure 1:1 relationship
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  fatherName: {
    type: String,
    trim: true,
    required: true
  },
  residentialStatus: {
    type: String,
    enum: ['resident', 'non_resident', 'resident_not_ordinary'],
    default: 'resident',
    required: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  employerCategory: {
    type: String,
    enum: ['govt', 'psu', 'private', 'other'],
    default: 'private'
  },
  alternateMobile: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
  },
  dependents: [{
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    relation: { 
      type: String, 
      enum: ['spouse', 'child', 'parent', 'other'],
      required: true 
    },
    // PAN is optional for minors, but good to have
    panNumber: {
      type: String,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
    }
  }],
  // Future-proof for refund processing
  bankAccounts: [{
    bankName: String,
    accountNumber: String, // Will need encryption later
    ifscCode: String,
    isPrimary: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('TaxProfile', taxProfileSchema);
