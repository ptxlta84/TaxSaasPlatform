const express = require('express');
const router = express.Router();
const { checkDatabase, checkDiskSpace } = require('../utils/health');

// @desc    Health Check
// @route   GET /health
router.get('/health', async (req, res) => {
    const dbHealth = await checkDatabase();
    const diskHealth = checkDiskSpace();
    
    const health = {
        status: dbHealth.healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
            database: dbHealth,
            disk: diskHealth,
            memory: process.memoryUsage(),
        }
    };

    const isHealthy = Object.values(health.checks).every(check => check.healthy);
    res.status(isHealthy ? 200 : 503).json(health);
});

// @desc    Readiness Probe
// @route   GET /ready
router.get('/ready', (req, res) => {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

module.exports = router;
