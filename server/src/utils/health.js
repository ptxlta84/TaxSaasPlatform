const mongoose = require('mongoose');

exports.checkDatabase = async () => {
    try {
        const state = mongoose.connection.readyState;
        return {
            healthy: state === 1,
            status: state === 1 ? 'connected' : 'disconnected',
            stateCode: state
        };
    } catch (error) {
        return {
            healthy: false,
            status: 'error',
            error: error.message
        };
    }
};

exports.checkDiskSpace = () => {
    // Basic mock for Node.js environment where 'fs' access to root might be restricted or platform-dependent
    // In production, use 'check-disk-space' package or similar.
    return {
        healthy: true,
        status: 'ok',
        free: 'unknown' 
    };
};
