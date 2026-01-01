const mongoose = require('mongoose');

const GSTRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gstin: { 
    type: String, 
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Regex for Indian GSTIN: 22AAAAA0000A1Z5
        return /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/.test(v);
      },
      message: props => `${props.value} is not a valid GSTIN!`
    }
  }, 
  legalName: { type: String, required: true },
  tradeName: { type: String },
  businessType: { 
    type: String, 
    enum: ['proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'other'],
    required: true 
  },
  panNumber: { type: String, required: true, uppercase: true },
  registrationDate: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'rejected', 'active', 'cancelled'],
    default: 'draft'
  },
  
  // Addresses
  principalAddress: {
     addressLine1: String,
     addressLine2: String,
     city: String,
     state: String,
     pincode: String
  },
  additionalPlaces: [{
     addressLine1: String,
     city: String,
     state: String,
     pincode: String
  }],

  // Promoters / Partners
  promoters: [{
      name: String,
      designation: String,
      pan: String,
      mobile: String,
      email: String
  }],

  // Bank Info
  bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
      branch: String
  },

  // Documents
  documents: {
      panCard: String, // URL
      aadharCard: String,
      addressProof: String,
      bankStatement: String
  }
}, { timestamps: true });

module.exports = mongoose.model('GSTRegistration', GSTRegistrationSchema);
