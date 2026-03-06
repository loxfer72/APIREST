const request = require('supertest');
const app = require('../app');

describe('GET /api/tools/:id', () => {
  it('retourne le détail complet d\'un outil existant', async () => {
    const res = await request(app).get('/api/tools/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('total_monthly_cost');
    expect(res.body).toHaveProperty('usage_metrics');
    expect(res.body.usage_metrics).toHaveProperty('last_30_days');
    expect(res.body.usage_metrics.last_30_days).toHaveProperty('total_sessions');
    expect(res.body.usage_metrics.last_30_days).toHaveProperty('avg_session_minutes');
  });

  it('retourne 404 pour un outil inexistant', async () => {
    const res = await request(app).get('/api/tools/999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tool not found');
    expect(res.body).toHaveProperty('message');
  });

  it('retourne 400 pour un ID non numérique', async () => {
    const res = await request(app).get('/api/tools/abc');
    expect(res.status).toBe(400);
  });
});