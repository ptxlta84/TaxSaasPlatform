const AuditLog = require('../models/AuditLog');

const logAction = async ({ user, action, resourceType, resourceId, details, req, status = 'success', metadata }) => {
    try {
        const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
        const userAgent = req?.get('User-Agent') || 'unknown';

        await AuditLog.create({
            user: user?._id || null,
            action,
            resourceType,
            resourceId,
            details,
            ipAddress,
            userAgent,
            status,
            metadata
        });
    } catch (error) {
        console.error('Audit Logging Failed:', error.message);
        // Fail silently to not block main flow, but log to console
    }
};

module.exports = { logAction };
