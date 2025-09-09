process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');

describe('CSRF protection', () => {
  test('rejects POST without CSRF token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:3001')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(403);
  });

  test('allows POST with valid CSRF token', async () => {
    const agent = request.agent(app);
    const tokenRes = await agent
      .get('/api/csrf-token')
      .set('Origin', 'http://localhost:3001');
    const csrfToken = tokenRes.body.csrfToken;
    const res = await agent
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:3001')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'bad', password: 'short' });
    expect(res.status).not.toBe(403);
  });
});
