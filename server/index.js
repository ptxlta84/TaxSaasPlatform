const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust Render's proxy (Required for Rate Limiting & Secure Cookies)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
const whitelist = ['http://localhost:5173', 'https://taxsaas-client.onrender.com'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
// Strict Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP
    message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/otp', authLimiter);
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/tax', require('./src/routes/tax.routes'));
app.use('/api/itr', require('./src/routes/itr.routes'));
app.use('/api/bookings', require('./src/routes/booking.routes'));
// app.use('/api/gst', require('./src/routes/gst.routes'));
app.use('/api/gst', require('./src/routes/gst.routes'));
// app.use('/api/compliance', require('./src/routes/compliance.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/admin', require('./src/routes/admin.routes')); // Admin Routes (RBAC)
app.use('/api', require('./src/routes/health')); // Mount /health routes

// Default Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
