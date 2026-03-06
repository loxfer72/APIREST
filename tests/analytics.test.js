const request = require('supertest');
const app = require('../app');

// ─────────────────────────────────────────────────────────────
// department-costs
// ─────────────────────────────────────────────────────────────
describe('GET /api/analytics/department-costs', () => {
  it('retourne la répartition des coûts par département', async () => {
    const res = await request(app).get('/api/analytics/department-costs');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('total_company_cost');
    expect(res.body.summary).toHaveProperty('most_expensive_department');
  });

  it('chaque item contient les champs requis', async () => {
    const res = await request(app).get('/api/analytics/department-costs');
    expect(res.status).toBe(200);
    res.body.data.forEach((item) => {
      expect(item).toHaveProperty('department');
      expect(item).toHaveProperty('total_cost');
      expect(item).toHaveProperty('tools_count');
      expect(item).toHaveProperty('total_users');
      expect(item).toHaveProperty('average_cost_per_tool');
      expect(item).toHaveProperty('cost_percentage');
    });
  });

  it('les pourcentages totalisent ~100%', async () => {
    const res = await request(app).get('/api/analytics/department-costs');
    const total = res.body.data.reduce((s, d) => s + d.cost_percentage, 0);
    expect(total).toBeGreaterThan(99.5);
    expect(total).toBeLessThanOrEqual(100.5);
  });

  it('supporte le tri par total_cost ASC', async () => {
    const res = await request(app).get('/api/analytics/department-costs?sort_by=total_cost&order=ASC');
    expect(res.status).toBe(200);
    const costs = res.body.data.map((d) => d.total_cost);
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
    }
  });

  it('retourne 400 pour un sort_by invalide', async () => {
    const res = await request(app).get('/api/analytics/department-costs?sort_by=invalid');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid analytics parameter');
  });
});

// ─────────────────────────────────────────────────────────────
// expensive-tools
// ─────────────────────────────────────────────────────────────
describe('GET /api/analytics/expensive-tools', () => {
  it('retourne le top des outils coûteux', async () => {
    const res = await request(app).get('/api/analytics/expensive-tools');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('analysis');
    expect(res.body.analysis).toHaveProperty('avg_cost_per_user_company');
    expect(res.body.analysis).toHaveProperty('potential_savings_identified');
  });

  it('les outils sont triés par coût décroissant', async () => {
    const res = await request(app).get('/api/analytics/expensive-tools');
    const costs = res.body.data.map((t) => t.monthly_cost);
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeLessThanOrEqual(costs[i - 1]);
    }
  });

  it('chaque outil a un efficiency_rating valide', async () => {
    const res = await request(app).get('/api/analytics/expensive-tools');
    const validRatings = ['excellent', 'good', 'average', 'low'];
    res.body.data.forEach((t) => {
      expect(validRatings).toContain(t.efficiency_rating);
    });
  });

  it('respecte le paramètre limit', async () => {
    const res = await request(app).get('/api/analytics/expensive-tools?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });

  it('retourne 400 pour limit négatif', async () => {
    const res = await request(app).get('/api/analytics/expensive-tools?limit=-5');
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('limit');
  });

  it('filtre par min_cost', async () => {
    const res = await request(app).get('/api/analytics/expensive-tools?min_cost=50');
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => {
      expect(t.monthly_cost).toBeGreaterThanOrEqual(50);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// tools-by-category
// ─────────────────────────────────────────────────────────────
describe('GET /api/analytics/tools-by-category', () => {
  it('retourne la répartition par catégorie', async () => {
    const res = await request(app).get('/api/analytics/tools-by-category');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('insights');
    expect(res.body.insights).toHaveProperty('most_expensive_category');
    expect(res.body.insights).toHaveProperty('most_efficient_category');
  });

  it('chaque catégorie contient les champs requis', async () => {
    const res = await request(app).get('/api/analytics/tools-by-category');
    res.body.data.forEach((item) => {
      expect(item).toHaveProperty('category_name');
      expect(item).toHaveProperty('tools_count');
      expect(item).toHaveProperty('total_cost');
      expect(item).toHaveProperty('total_users');
      expect(item).toHaveProperty('percentage_of_budget');
      expect(item).toHaveProperty('average_cost_per_user');
    });
  });

  it('les pourcentages totalisent ~100%', async () => {
    const res = await request(app).get('/api/analytics/tools-by-category');
    const total = res.body.data.reduce((s, d) => s + d.percentage_of_budget, 0);
    expect(total).toBeGreaterThan(99.5);
    expect(total).toBeLessThanOrEqual(100.5);
  });
});

// ─────────────────────────────────────────────────────────────
// low-usage-tools
// ─────────────────────────────────────────────────────────────
describe('GET /api/analytics/low-usage-tools', () => {
  it('retourne les outils sous-utilisés par défaut (max_users=5)', async () => {
    const res = await request(app).get('/api/analytics/low-usage-tools');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('savings_analysis');
    res.body.data.forEach((t) => {
      expect(t.active_users_count).toBeLessThanOrEqual(5);
    });
  });

  it('respecte le paramètre max_users', async () => {
    const res = await request(app).get('/api/analytics/low-usage-tools?max_users=2');
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => {
      expect(t.active_users_count).toBeLessThanOrEqual(2);
    });
  });

  it('chaque outil a un warning_level et potential_action valides', async () => {
    const res = await request(app).get('/api/analytics/low-usage-tools');
    const validLevels = ['high', 'medium', 'low'];
    res.body.data.forEach((t) => {
      expect(validLevels).toContain(t.warning_level);
      expect(t).toHaveProperty('potential_action');
    });
  });

  it('potential_annual_savings = potential_monthly_savings * 12', async () => {
    const res = await request(app).get('/api/analytics/low-usage-tools');
    const { potential_monthly_savings, potential_annual_savings } = res.body.savings_analysis;
    expect(Math.round(potential_annual_savings * 100)).toBe(
      Math.round(potential_monthly_savings * 12 * 100)
    );
  });
});

// ─────────────────────────────────────────────────────────────
// vendor-summary
// ─────────────────────────────────────────────────────────────
describe('GET /api/analytics/vendor-summary', () => {
  it('retourne le résumé par vendor', async () => {
    const res = await request(app).get('/api/analytics/vendor-summary');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('vendor_insights');
    expect(res.body.vendor_insights).toHaveProperty('most_expensive_vendor');
    expect(res.body.vendor_insights).toHaveProperty('most_efficient_vendor');
    expect(res.body.vendor_insights).toHaveProperty('single_tool_vendors');
  });

  it('chaque vendor a un vendor_efficiency valide', async () => {
    const res = await request(app).get('/api/analytics/vendor-summary');
    const validEfficiencies = ['excellent', 'good', 'average', 'poor'];
    res.body.data.forEach((v) => {
      expect(validEfficiencies).toContain(v.vendor_efficiency);
    });
  });

  it('les départements sont triés alphabétiquement sans doublons', async () => {
    const res = await request(app).get('/api/analytics/vendor-summary');
    res.body.data.forEach((v) => {
      if (v.departments) {
        const depts = v.departments.split(',');
        const sorted = [...depts].sort();
        expect(depts).toEqual(sorted);
        // Pas de doublons
        expect(new Set(depts).size).toBe(depts.length);
      }
    });
  });
});
