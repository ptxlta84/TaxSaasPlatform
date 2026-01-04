const { validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const otpService = require('../services/otpService');
const { logAction } = require('../services/auditService');
const crypto = require('crypto');

// Generate Access and Refresh Tokens
const generateTokenPair = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Short-lived
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

  return { accessToken, refreshToken };
};

// Send Token Response with Cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days matches JWT_REFRESH_EXPIRE fallback
    ),
    httpOnly: true, // Prevent client-side JS access
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict' // CSRF protection
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, options)
    .json({
      success: true,
      message,
      accessToken, // Only access token is sent in JSON
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        userType: user.userType
      }
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, mobile, userType, panNumber } = req.body;
  
  // Validate Request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
      mobile,
      userType,
      panNumber,
      taxRegime: req.body.taxRegime || null
    });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome aboard!');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res, 'Login successful! Welcome back!');
    
    // Log Success
    logAction({
        user,
        action: 'LOGIN',
        resourceType: 'Auth',
        resourceId: user._id,
        details: { email },
        req,
        status: 'success'
    });

  } catch (err) {
    // Log Failure
    logAction({
        action: 'LOGIN_FAILED',
        resourceType: 'Auth',
        details: { email, error: err.message },
        req,
        status: 'failure'
    });
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (Validates Cookie)
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate NEW Access Token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Not authorized, invalid refresh token' });
  }
};

// @desc    Logout user / Clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'User logged out' });

  logAction({
      user: req.user, // Auth middleware populates this if valid
      action: 'LOGOUT',
      resourceType: 'Auth',
      details: {},
      req
  });
};

// @desc    Send OTP to mobile
// @route   POST /api/auth/otp/send
// @access  Public
exports.sendOTP = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    await otpService.generateOTP(mobile);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/otp/verify
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  
  if (!mobile || !otp) {
    return res.status(400).json({ message: 'Mobile and OTP are required' });
  }

  try {
    const result = await otpService.verifyOTP(mobile, otp);
    if (result.valid) {
      res.json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed' });
  }
};
