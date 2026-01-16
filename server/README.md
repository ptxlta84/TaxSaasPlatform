# TaxSaaS Platform - Server

Node.js/Express backend for the TaxSaaS Platform.

## 🛠️ Verification Tool

A manual verification script is included to validate core backend functionality (Auth, RBAC, Validation) independent of the frontend.

### `scripts/verify_backend.js`

**Purpose**: Quickly verify that API endpoints are working correctly after refactors or updates.

**Prerequisites**:

- Server must be running locally (`npm run dev`).
- MongoDB must be accessible.
- A test user (seeded via `create_test_user.js`) must exist.

**Usage**:

```bash
# Run against default local server (http://localhost:5000)
node scripts/verify_backend.js

# Run against custom URL or user
set API_BASE_URL=http://localhost:8080/api
set TEST_EMAIL=admin@example.com
node scripts/verify_backend.js
```

> **⚠️ Note**: This tool is for **manual development testing only**. Do not run it in production or CI pipelines.
