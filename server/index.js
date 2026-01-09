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
// Check critical environment variables
console.log('Startup: Checking Environment Variables...');
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET']; // Critical for boot
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error('FATAL ERROR: Missing critical environment variables:', missingEnv.join(', '));
    console.error('The server cannot start without these variables. Please configure them in Render dashboard.');
    // We expect db.js to crash for mongo, but we warn here explicitly.
} else {
    console.log('✅ Critical environment variables are present.');
}

// DEBUG: Log Directory Structure to find React Build
const fs = require('fs');
const path = require('path');
console.log('📂 DEBUG: Current Directory (__dirname):', __dirname);
try {
    console.log('📂 DEBUG: Root Listing:', fs.readdirSync(__dirname));
    const publicPath = path.join(__dirname, 'public');
    console.log('📂 DEBUG: Public Path Target:', publicPath);
    if (fs.existsSync(publicPath)) {
        console.log('📂 DEBUG: Public Folder Listing:', fs.readdirSync(publicPath));
    } else {
        console.error('❌ DEBUG: Public folder DOES NOT EXIST at:', publicPath);
    }
} catch (e) {
    console.error('❌ DEBUG: Error listing directories:', e.message);
}

// Warn for encryption keys (Lazy loaded, but good to have)
if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
    console.warn('⚠️ WARNING: ENCRYPTION_KEY or ENCRYPTION_IV is missing. Encryption features will fail.');
}

connectDB();

const app = express();

// Trust Render's proxy (Required for Rate Limiting & Secure Cookies)
app.set('trust proxy', 1);

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Security Middleware
app.use(helmet());
const whitelist = [
    'http://localhost:5173', 
    'http://localhost:3000', // Added for local Docker environment
    'https://taxsaas-client.onrender.com',
    'https://paytax.com',
    'https://www.paytax.com'
];
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
// Routes
// Strict Rate Limiting for Auth
/* const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP
    message: { message: 'Too many login attempts, please try again after 15 minutes' }
}); */

// Routes

// Routes
// app.use('/api/auth/login', authLimiter); // Disabled for debugging
// app.use('/api/auth/otp', authLimiter); // Disabled for debugging
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/tax', require('./src/routes/tax.routes'));
app.use('/api/itr', require('./src/routes/itr.routes'));
app.use('/api/bookings', require('./src/routes/booking.routes'));
// app.use('/api/gst', require('./src/routes/gst.routes'));
app.use('/api/gst', require('./src/routes/gst.routes'));
// app.use('/api/compliance', require('./src/routes/compliance.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/tax-profile', require('./src/routes/taxProfile.routes'));
app.use('/api/admin', require('./src/routes/admin.routes')); // Admin Routes (RBAC)
app.use('/api/income', require('./src/routes/income.routes'));
app.use('/api/deductions', require('./src/routes/deduction.routes'));
app.use('/api/documents', require('./src/routes/documents.js'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/debug', require('./src/routes/debug')); // [NEW] Debug Tools
app.use('/api', require('./src/routes/health')); // Mount /health routes

// Default Route (Modified for Monolith Deployment)
// Serve React Static Files (Production Only or when built)
const path = require('path');
// Serve static files from the React app
// DOCKER: Assets are copied to /app/server/public
app.use(express.static(path.join(__dirname, 'public')));

// Express 5 requires Regex for wildcard match, '*' is no longer valid string path
app.get(/.*/, (req, res) => {
    // If not an API route (handled above), send React index.html
    const indexPath = path.join(__dirname, 'public/index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('API is running... (React Client not built or not found)');
    }
});

// EMERGENCY DEBUG ENDPOINT (Direct GET)
app.get('/api/debug/form16-upload', (req, res) => {
  console.log('📄 DEBUG: Direct GET hit');
  res.json({
    success: true,
    extractedData: {
      employer: { 
        name: "Test Corp (Restored)",
        tan: "TEST12345X",
        address: "Restored Debug Route"
      },
      tdsDeducted: 75000,
      grossSalary: 850000
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`PORT Binding: ${PORT}`); // Confirm port for Render
});
