const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // May be system action or unauthenticated attempt
    },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'CREATE_INVOICE'
    resourceType: { type: String }, // 'Invoice', 'TaxReturn'
    resourceId: { type: String },
    details: { type: Object }, // Flexible JSON for prev/new values
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
    metadata: { type: Map, of: String } // Flexible key-value pairs for extra context
}, {
    timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
