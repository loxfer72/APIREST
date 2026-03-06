const request = require('supertest');
const app = require('../app');

describe('PUT /api/tools/:id', () => {
  it('met à jour un outil existant', async () => {
    const res = await request(app)
      .put('/api/tools/1')
      .send({ monthly_cost: 9.99 });
    expect(res.status).toBe(200);
    expect(res.body.monthly_cost).toBe(9.99);
    expect(res.body).toHaveProperty('updated_at');
  });

  it('change le statut en deprecated', async () => {
    const res = await request(app)
      .put('/api/tools/2')
      .send({ status: 'deprecated' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('deprecated');
  });

  it('retourne 404 pour un outil inexistant', async () => {
    const res = await request(app)
      .put('/api/tools/999999')
      .send({ monthly_cost: 5.00 });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tool not found');
  });

  it('retourne 400 si le statut est invalide', async () => {
    const res = await request(app)
      .put('/api/tools/1')
      .send({ status: 'invalid_status' });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('status');
  });

  it('retourne 400 si le body est vide', async () => {
    const res = await request(app).put('/api/tools/1').send({});
    expect(res.status).toBe(400);
  });
});