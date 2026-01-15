const request = require('supertest');
const express = require('express');

const app = express();
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

describe('Server Health Check', () => {
  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('Basic Math Test', () => {
      expect(1 + 1).toBe(2);
  });
});
