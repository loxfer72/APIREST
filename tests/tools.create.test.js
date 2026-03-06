const request = require('supertest');
const app = require('../app');

const validTool = {
  name: `TestTool_${Date.now()}`, // Nom unique à chaque run
  description: 'Outil de test automatisé',
  vendor: 'TestVendor',
  website_url: 'https://testvendor.com',
  category_id: 1,
  monthly_cost: 12.50,
  owner_department: 'Engineering',
};

describe('POST /api/tools', () => {
  it('crée un outil valide et retourne 201', async () => {
    const res = await request(app).post('/api/tools').send(validTool);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(validTool.name);
    expect(res.body.status).toBe('active');
    expect(res.body.active_users_count).toBe(0);
  });

  it('retourne 400 si le nom est manquant', async () => {
    const { name, ...withoutName } = validTool;
    const res = await request(app).post('/api/tools').send(withoutName);
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('name');
  });

  it('retourne 400 si le coût est négatif', async () => {
    const res = await request(app)
      .post('/api/tools')
      .send({ ...validTool, name: `TestNeg_${Date.now()}`, monthly_cost: -5 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('monthly_cost');
  });

  it('retourne 400 si le département est invalide', async () => {
    const res = await request(app)
      .post('/api/tools')
      .send({ ...validTool, name: `TestDept_${Date.now()}`, owner_department: 'InvalidDept' });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('owner_department');
  });

  it('retourne 400 si l\'URL est invalide', async () => {
    const res = await request(app)
      .post('/api/tools')
      .send({ ...validTool, name: `TestUrl_${Date.now()}`, website_url: 'pas-une-url' });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('website_url');
  });

  it('retourne 400 si category_id inexistant', async () => {
    const res = await request(app)
      .post('/api/tools')
      .send({ ...validTool, name: `TestCat_${Date.now()}`, category_id: 99999 });
    expect(res.status).toBe(400);
  });
});