const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const { method, url, body } = req;
    
    // Redact body for sensitive routes
    const sensitiveRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password'];
    let safeBody = body;

    if (sensitiveRoutes.some(route => url.startsWith(route))) {
        safeBody = { ...body }; // Clone
        if (safeBody.password) safeBody.password = '[REDACTED]';
        if (safeBody.token) safeBody.token = '[REDACTED]';
        if (safeBody.otp) safeBody.otp = '[REDACTED]';
        // Or simply exclude entirely
        if (process.env.NODE_ENV === 'production') safeBody = '[HIDDEN IN PROD]';
    }

    logger.info(`Incoming Request: ${method} ${url}`, { 
        method, 
        url, 
        body: safeBody,
        ip: req.ip 
    });

    next();
};

module.exports = requestLogger;
