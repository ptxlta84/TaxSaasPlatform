const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't return password by default
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    // Validate Indian mobile number format (simple check)
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  panNumber: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls/undefined if not provided initially
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  aadhaarLinked: {
    type: Boolean, 
    default: false
  },
  userType: {
    type: String,
    enum: ['salaried', 'business', 'nri', 'ca'],
    default: 'salaried'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  taxRegime: {
    type: String,
    enum: ['old', 'new', null],
    default: null
  },
  filingStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'filed', 'verified'],
    default: 'not_started'
  },
  refreshToken: {
    type: String,
    select: false
  },
  refreshTokenExpire: {
    type: Date,
    select: false
  },
  refreshTokenFamily: {
    type: [String], // Array of used refresh tokens for reuse detection
    select: false,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
