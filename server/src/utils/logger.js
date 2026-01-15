const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'tax-saas-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

// Helper to safely log objects by redacting keys
logger.safeLog = (message, data = {}) => {
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
    const safeData = JSON.parse(JSON.stringify(data)); // Deep clone

    const redact = (obj) => {
        for (const key in obj) {
            if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                redact(obj[key]);
            }
        }
    };
    redact(safeData);
    logger.info(message, safeData);
};

module.exports = logger;
