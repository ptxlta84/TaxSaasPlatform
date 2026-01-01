const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  caId: { 
    type: String, // Ideally ObjectId ref 'User', but using String/Mock ID for now
    required: true 
  },
  caName: { type: String, required: true }, // Store snapshot of name
  consultationType: { 
    type: String, 
    enum: ['quick_review', 'full_filing', 'ca_managed'],
    required: true 
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., "10:00 - 10:30"
  duration: { type: Number, required: true }, // in minutes
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed' // Auto-confirm for prototype
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'paid' // Auto-pay for prototype
  },
  paymentMethod: { type: String, default: 'UPI' },
  meetingLink: { type: String },
  notes: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
