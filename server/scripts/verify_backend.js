/**
 * BACKEND VERIFICATION SCRIPT
 * 
 * Purpose:
 *   Verifies core backend functionality:
 *   - Authentication (Login success/failure)
 *   - RBAC/Authorization (Protected routes)
 *   - Basic Input Validation
 * 
 * When to run:
 *   After any backend refactor (controllers, middleware, auth logic).
 * 
 * Prerequisites:
 *   1. MongoDB must be running (local or docker).
 *   2. Backend server must be running (e.g., on port 5000).
 * 
 * Environment Variables (Optional):
 *   API_BASE_URL    (Default: http://localhost:5000/api)
 *   TEST_EMAIL      (Default: test@example.com)
 *   TEST_PASSWORD   (Default: password123.)
 * 
 * NOTE: Manual verification tool ONLY. NOT for CI or production use.
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER = { 
    email: process.env.TEST_EMAIL || 'test@example.com', 
    password: process.env.TEST_PASSWORD || 'password123.' 
};

async function runTests() {
    console.info('\n=============================================');
    console.info('       BACKEND VERIFICATION SUITE       ');
    console.info('=============================================\n');
    
    let passed = 0;
    let failed = 0;

    const assert = (desc, condition) => {
        if (condition) {
            console.info(`✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${desc}`);
            failed++;
        }
    };

    try {
        // --- TEST A: AUTHENTICATION ---
        console.info('[TEST A1] Login with Valid Credentials');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, TEST_USER, { validateStatus: () => true });
        
        if (loginRes.status !== 200) {
            console.error('DEBUG: Login Failed. Status:', loginRes.status);
            console.error('DEBUG: Response:', JSON.stringify(loginRes.data, null, 2));
        }

        assert('Status is 200', loginRes.status === 200);
        assert('Response contains token', !!loginRes.data.accessToken);
        
        // Security Check: Ensure sensitive data is not in response body
        const bodyStr = JSON.stringify(loginRes.data);
        assert('No password leaked in response', !bodyStr.includes('password'));

        const token = loginRes.data.accessToken;
        if (!token) {
            console.error('FATAL: No token received. Aborting dependent tests.');
            process.exit(1);
        }

        console.info('\n[TEST A2] Login with Invalid Credentials');
        const failRes = await axios.post(`${BASE_URL}/auth/login`, { ...TEST_USER, password: 'WRONG_PASSWORD' }, { validateStatus: () => true });
        assert('Status is 400 or 401', [400, 401].includes(failRes.status));


        // --- TEST B: RBAC / AUTHORIZATION ---
        console.info('\n[TEST B1] Protected Route (GET /api/documents) - With Valid Token');
        const docRes = await axios.get(`${BASE_URL}/documents`, { 
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true 
        });
        // 200/201 = Success, 404 = Success (User has no docs), 401/403 = Failure
        assert('Access Granted (Status 200/201/404)', [200, 201, 404].includes(docRes.status));

        console.info('\n[TEST B2] Protected Route (GET /api/documents) - Without Token');
        const noTokenRes = await axios.get(`${BASE_URL}/documents`, { validateStatus: () => true });
        assert('Access Denied (Status 401)', noTokenRes.status === 401);


        // --- TEST C: VALIDATION ---
        console.info('\n[TEST C1] Malformed Payload (Validation Check)');
        // Sending invalid email format
        const badPayloadRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'not-an-email', password: '123' }, { validateStatus: () => true });
        assert('Server rejects bad email (Status 400/401)', [400, 401].includes(badPayloadRes.status));

    } catch (e) {
        console.error('\n❌ FATAL EXECUTION ERROR:', e.message);
        if (e.code === 'ECONNREFUSED') {
            console.error('   -> Check if the server is running on port 5000!');
        }
        failed++;
    }

    console.info('\n=============================================');
    console.info(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.info('=============================================\n');
    
    if (failed > 0) process.exit(1);
}

runTests();
