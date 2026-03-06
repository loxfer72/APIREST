const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const { Tool, Category } = require('../models');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Arrondit à N décimales */
const round = (value, decimals = 2) =>
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

/** Calcule le efficiency_rating d'un outil basé sur cost_per_user vs moyenne entreprise */
const getEfficiencyRating = (costPerUser, avgCostPerUser) => {
  if (avgCostPerUser === 0) return 'average';
  const ratio = costPerUser / avgCostPerUser;
  if (ratio < 0.5) return 'excellent';
  if (ratio < 0.8) return 'good';
  if (ratio <= 1.2) return 'average';
  return 'low';
};

/** Calcule le vendor_efficiency basé sur average_cost_per_user du vendor */
const getVendorEfficiency = (avgCostPerUser) => {
  if (avgCostPerUser < 5) return 'excellent';
  if (avgCostPerUser <= 15) return 'good';
  if (avgCostPerUser <= 25) return 'average';
  return 'poor';
};

/** Calcule le warning_level d'un outil sous-utilisé */
const getWarningLevel = (costPerUser) => {
  if (costPerUser > 50) return 'high';
  if (costPerUser >= 20) return 'medium';
  return 'low';
};

/** Retourne l'action recommandée selon le warning_level */
const getPotentialAction = (warningLevel) => {
  const actions = {
    high: 'Consider canceling or downgrading',
    medium: 'Review usage and consider optimization',
    low: 'Monitor usage trends',
  };
  return actions[warningLevel];
};

// ─────────────────────────────────────────────────────────────
// 3.1.1 GET /api/analytics/department-costs
// ─────────────────────────────────────────────────────────────
const getDepartmentCosts = async (query) => {
  const { sort_by = 'total_cost', order = 'DESC' } = query;

  // Colonnes triables autorisées
  const SORTABLE = {
    total_cost: 'total_cost',
    department: 'owner_department',
    tools_count: 'tools_count',
    total_users: 'total_users',
  };
  const sortColumn = SORTABLE[sort_by] || 'total_cost';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Agrégation par département — uniquement outils actifs
  const rows = await Tool.findAll({
    where: { status: 'active' },
    attributes: [
      'owner_department',
      [fn('SUM', col('monthly_cost')), 'total_cost'],
      [fn('COUNT', col('id')), 'tools_count'],
      [fn('SUM', col('active_users_count')), 'total_users'],
    ],
    group: ['owner_department'],
    order: [[literal(sortColumn), sortOrder]],
    raw: true,
  });

  if (rows.length === 0) {
    return {
      data: [],
      message: 'No analytics data available - ensure tools data exists',
      summary: { total_company_cost: 0 },
    };
  }

  // Calcul du coût total entreprise pour les pourcentages
  const totalCompanyCost = rows.reduce((sum, r) => sum + parseFloat(r.total_cost), 0);

  const data = rows.map((r) => {
    const total_cost = round(parseFloat(r.total_cost));
    const tools_count = parseInt(r.tools_count);
    return {
      department: r.owner_department,
      total_cost,
      tools_count,
      total_users: parseInt(r.total_users),
      average_cost_per_tool: tools_count > 0 ? round(total_cost / tools_count) : 0,
      cost_percentage: round((total_cost / totalCompanyCost) * 100, 1),
    };
  });

  // Département le plus coûteux (alphabétique si égalité)
  const mostExpensive = [...data].sort((a, b) => {
    if (b.total_cost !== a.total_cost) return b.total_cost - a.total_cost;
    return a.department.localeCompare(b.department);
  })[0];

  return {
    data,
    summary: {
      total_company_cost: round(totalCompanyCost),
      departments_count: data.length,
      most_expensive_department: mostExpensive?.department || null,
    },
  };
};

// ─────────────────────────────────────────────────────────────
// 3.1.2 GET /api/analytics/expensive-tools
// ─────────────────────────────────────────────────────────────
const getExpensiveTools = async (query) => {
  const { limit = 10, min_cost } = query;

  const where = { status: 'active' };
  if (min_cost !== undefined) {
    where.monthly_cost = { [Op.gte]: parseFloat(min_cost) };
  }

  const tools = await Tool.findAll({
    where,
    order: [['monthly_cost', 'DESC']],
    limit: parseInt(limit),
    raw: true,
  });

  if (tools.length === 0) {
    return {
      data: [],
      message: 'No analytics data available - ensure tools data exists',
      analysis: { total_tools_analyzed: 0, avg_cost_per_user_company: 0, potential_savings_identified: 0 },
    };
  }

  // Moyenne pondérée entreprise : total_cost / total_users (outils avec users > 0)
  const allActiveTools = await Tool.findAll({
    where: { status: 'active', active_users_count: { [Op.gt]: 0 } },
    attributes: ['monthly_cost', 'active_users_count'],
    raw: true,
  });

  const totalCostAll = allActiveTools.reduce((s, t) => s + parseFloat(t.monthly_cost), 0);
  const totalUsersAll = allActiveTools.reduce((s, t) => s + parseInt(t.active_users_count), 0);
  const avgCostPerUser = totalUsersAll > 0 ? totalCostAll / totalUsersAll : 0;

  // Compte total des outils analysés (sans limit, avec filtre min_cost)
  const totalAnalyzed = await Tool.count({ where });

  const data = tools.map((t) => {
    const active_users_count = parseInt(t.active_users_count);
    // Gestion division par zéro
    const cost_per_user = active_users_count > 0
      ? round(parseFloat(t.monthly_cost) / active_users_count)
      : round(parseFloat(t.monthly_cost)); // 0 users = coût total = cost_per_user

    const efficiency_rating = active_users_count > 0
      ? getEfficiencyRating(cost_per_user, avgCostPerUser)
      : 'low'; // 0 users → toujours low

    return {
      id: t.id,
      name: t.name,
      monthly_cost: round(parseFloat(t.monthly_cost)),
      active_users_count,
      cost_per_user,
      department: t.owner_department,
      vendor: t.vendor,
      efficiency_rating,
    };
  });

  // Économies potentielles = somme des coûts des outils "low"
  const potentialSavings = data
    .filter((t) => t.efficiency_rating === 'low')
    .reduce((s, t) => s + t.monthly_cost, 0);

  return {
    data,
    analysis: {
      total_tools_analyzed: totalAnalyzed,
      avg_cost_per_user_company: round(avgCostPerUser),
      potential_savings_identified: round(potentialSavings),
    },
  };
};

// ─────────────────────────────────────────────────────────────
// 3.1.3 GET /api/analytics/tools-by-category
// ─────────────────────────────────────────────────────────────
const getToolsByCategory = async () => {
  const rows = await Tool.findAll({
    where: { status: 'active' },
    attributes: [
      'category_id',
      [fn('COUNT', col('Tool.id')), 'tools_count'],
      [fn('SUM', col('monthly_cost')), 'total_cost'],
      [fn('SUM', col('active_users_count')), 'total_users'],
    ],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
    group: ['Tool.category_id', 'category.id'],
    raw: true,
    nest: true,
  });

  if (rows.length === 0) {
    return {
      data: [],
      message: 'No analytics data available - ensure tools data exists',
      insights: { most_expensive_category: null, most_efficient_category: null },
    };
  }

  const totalCompanyCost = rows.reduce((s, r) => s + parseFloat(r.total_cost), 0);

  const data = rows.map((r) => {
    const total_cost = round(parseFloat(r.total_cost));
    const total_users = parseInt(r.total_users);
    return {
      category_name: r.category.name,
      tools_count: parseInt(r.tools_count),
      total_cost,
      total_users,
      percentage_of_budget: round((total_cost / totalCompanyCost) * 100, 1),
      // Gestion division par zéro
      average_cost_per_user: total_users > 0 ? round(total_cost / total_users) : 0,
    };
  });

  // Catégorie la plus coûteuse
  const mostExpensive = [...data].sort((a, b) => {
    if (b.total_cost !== a.total_cost) return b.total_cost - a.total_cost;
    return a.category_name.localeCompare(b.category_name);
  })[0];

  // Catégorie la plus efficace = plus bas average_cost_per_user (hors 0 users)
  const withUsers = data.filter((d) => d.total_users > 0);
  const mostEfficient = withUsers.length > 0
    ? [...withUsers].sort((a, b) => {
        if (a.average_cost_per_user !== b.average_cost_per_user)
          return a.average_cost_per_user - b.average_cost_per_user;
        return a.category_name.localeCompare(b.category_name);
      })[0]
    : null;

  return {
    data,
    insights: {
      most_expensive_category: mostExpensive?.category_name || null,
      most_efficient_category: mostEfficient?.category_name || null,
    },
  };
};

// ─────────────────────────────────────────────────────────────
// 3.1.4 GET /api/analytics/low-usage-tools
// ─────────────────────────────────────────────────────────────
const getLowUsageTools = async (query) => {
  const maxUsers = query.max_users !== undefined ? parseInt(query.max_users) : 5;

  const tools = await Tool.findAll({
    where: {
      status: 'active',
      active_users_count: { [Op.lte]: maxUsers },
    },
    order: [['monthly_cost', 'DESC']],
    raw: true,
  });

  if (tools.length === 0) {
    return {
      data: [],
      message: 'No analytics data available - ensure tools data exists',
      savings_analysis: {
        total_underutilized_tools: 0,
        potential_monthly_savings: 0,
        potential_annual_savings: 0,
      },
    };
  }

  const data = tools.map((t) => {
    const active_users_count = parseInt(t.active_users_count);
    const monthly_cost = round(parseFloat(t.monthly_cost));

    // Gestion division par zéro : 0 users → warning_level = "high" automatiquement
    const cost_per_user = active_users_count > 0
      ? round(monthly_cost / active_users_count)
      : monthly_cost;

    const warning_level = active_users_count === 0
      ? 'high'
      : getWarningLevel(cost_per_user);

    return {
      id: t.id,
      name: t.name,
      monthly_cost,
      active_users_count,
      cost_per_user,
      department: t.owner_department,
      vendor: t.vendor,
      warning_level,
      potential_action: getPotentialAction(warning_level),
    };
  });

  // Économies potentielles = somme des coûts "high" + "medium"
  const potentialMonthlySavings = round(
    data
      .filter((t) => t.warning_level === 'high' || t.warning_level === 'medium')
      .reduce((s, t) => s + t.monthly_cost, 0)
  );

  return {
    data,
    savings_analysis: {
      total_underutilized_tools: data.length,
      potential_monthly_savings: potentialMonthlySavings,
      potential_annual_savings: round(potentialMonthlySavings * 12),
    },
  };
};

// ─────────────────────────────────────────────────────────────
// 3.1.5 GET /api/analytics/vendor-summary
// ─────────────────────────────────────────────────────────────
const getVendorSummary = async () => {
  // Agrégation par vendor avec Sequelize
  const rows = await Tool.findAll({
    where: { status: 'active' },
    attributes: [
      'vendor',
      [fn('COUNT', col('id')), 'tools_count'],
      [fn('SUM', col('monthly_cost')), 'total_monthly_cost'],
      [fn('SUM', col('active_users_count')), 'total_users'],
    ],
    group: ['vendor'],
    order: [['vendor', 'ASC']],
    raw: true,
  });

  if (rows.length === 0) {
    return {
      data: [],
      message: 'No analytics data available - ensure tools data exists',
      vendor_insights: {
        most_expensive_vendor: null,
        most_efficient_vendor: null,
        single_tool_vendors: 0,
      },
    };
  }

  // Récupère les départements par vendor (pour la concaténation)
  const toolsByVendor = await Tool.findAll({
    where: { status: 'active' },
    attributes: ['vendor', 'owner_department'],
    raw: true,
  });

  // Map vendor → départements uniques triés alphabétiquement
  const vendorDepartments = {};
  toolsByVendor.forEach(({ vendor, owner_department }) => {
    if (!vendorDepartments[vendor]) vendorDepartments[vendor] = new Set();
    vendorDepartments[vendor].add(owner_department);
  });

  const data = rows.map((r) => {
    const total_users = parseInt(r.total_users);
    const total_monthly_cost = round(parseFloat(r.total_monthly_cost));
    const average_cost_per_user = total_users > 0
      ? round(total_monthly_cost / total_users)
      : 0;

    const depts = vendorDepartments[r.vendor]
      ? [...vendorDepartments[r.vendor]].sort().join(',')
      : '';

    return {
      vendor: r.vendor,
      tools_count: parseInt(r.tools_count),
      total_monthly_cost,
      total_users,
      departments: depts,
      average_cost_per_user,
      vendor_efficiency: getVendorEfficiency(average_cost_per_user),
    };
  });

  // Vendor le plus coûteux
  const mostExpensive = [...data].sort((a, b) => b.total_monthly_cost - a.total_monthly_cost)[0];

  // Vendor le plus efficace (plus bas avg_cost_per_user, hors 0 users)
  const withUsers = data.filter((d) => d.total_users > 0);
  const mostEfficient = withUsers.length > 0
    ? [...withUsers].sort((a, b) => {
        if (a.average_cost_per_user !== b.average_cost_per_user)
          return a.average_cost_per_user - b.average_cost_per_user;
        return a.vendor.localeCompare(b.vendor);
      })[0]
    : null;

  // Vendors avec exactement 1 outil actif
  const singleToolVendors = data.filter((d) => d.tools_count === 1).length;

  return {
    data,
    vendor_insights: {
      most_expensive_vendor: mostExpensive?.vendor || null,
      most_efficient_vendor: mostEfficient?.vendor || null,
      single_tool_vendors: singleToolVendors,
    },
  };
};

module.exports = {
  getDepartmentCosts,
  getExpensiveTools,
  getToolsByCategory,
  getLowUsageTools,
  getVendorSummary,
};
