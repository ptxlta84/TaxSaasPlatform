// Simple in-memory OTP store for development
// In production, use Redis with expiration
const otpStore = new Map();

exports.generateOTP = async (mobile) => {
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store with 10 minute expiry
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(mobile, { otp, expiresAt });

  // In a real app, integrate with SMS provider (Twilio, Gupshup, Msg91)
  console.log(`[DEV ONLY] OTP for ${mobile}: ${otp}`);

  return otp;
};

exports.verifyOTP = async (mobile, otp) => {
  const storedData = otpStore.get(mobile);
  
  if (!storedData) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(mobile);
    return { valid: false, message: 'OTP expired' };
  }

  if (storedData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  // Clear OTP after successful verification
  otpStore.delete(mobile);
  return { valid: true };
};
