const request = require('supertest');
const app = require('../app');

describe('GET /api/tools', () => {
  it('retourne la liste complète des outils', async () => {
    const res = await request(app).get('/api/tools');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('filtered');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filtre par département', async () => {
    const res = await request(app).get('/api/tools?department=Engineering');
    expect(res.status).toBe(200);
    res.body.data.forEach((tool) => {
      expect(tool.owner_department).toBe('Engineering');
    });
  });

  it('filtre par statut', async () => {
    const res = await request(app).get('/api/tools?status=active');
    expect(res.status).toBe(200);
    res.body.data.forEach((tool) => {
      expect(tool.status).toBe('active');
    });
  });

  it('filtre par coût min et max', async () => {
    const res = await request(app).get('/api/tools?min_cost=5&max_cost=20');
    expect(res.status).toBe(200);
    res.body.data.forEach((tool) => {
      expect(tool.monthly_cost).toBeGreaterThanOrEqual(5);
      expect(tool.monthly_cost).toBeLessThanOrEqual(20);
    });
  });

  it('gère la pagination', async () => {
    const res = await request(app).get('/api/tools?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
  });

  it('retourne un tableau vide si aucun résultat', async () => {
    const res = await request(app).get('/api/tools?department=Design&min_cost=999');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.filtered).toBe(0);
  });
});