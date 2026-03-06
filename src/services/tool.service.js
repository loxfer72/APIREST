const { Op, fn, col, literal } = require('sequelize');
const { Tool, Category, UsageLog } = require('../models');

/**
 * Crée une erreur 404 normalisée
 */
const notFound = (id) => {
  const err = new Error(`Tool with ID ${id} does not exist`);
  err.status = 404;
  err.error = 'Tool not found';
  return err;
};

/**
 * Formate un outil Sequelize en objet réponse propre
 */
const formatTool = (tool) => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
  vendor: tool.vendor,
  website_url: tool.website_url,
  category: tool.category ? tool.category.name : null,
  monthly_cost: parseFloat(tool.monthly_cost),
  owner_department: tool.owner_department,
  status: tool.status,
  active_users_count: tool.active_users_count,
  created_at: tool.created_at,
  updated_at: tool.updated_at,
});

/**
 * GET /api/tools — liste avec filtres, pagination et tri
 */
const listTools = async (query) => {
  const {
    department,
    status,
    category,
    min_cost,
    max_cost,
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    order = 'DESC',
  } = query;

  // Construction dynamique du WHERE
  const where = {};

  if (department) where.owner_department = department;
  if (status) where.status = status;
  if (min_cost !== undefined || max_cost !== undefined) {
    where.monthly_cost = {};
    if (min_cost !== undefined) where.monthly_cost[Op.gte] = parseFloat(min_cost);
    if (max_cost !== undefined) where.monthly_cost[Op.lte] = parseFloat(max_cost);
  }

  // Filtre par nom de catégorie (jointure)
  const categoryWhere = {};
  if (category) categoryWhere.name = category;

  // Colonnes triables autorisées (sécurité : évite injection via ORDER BY)
  const SORTABLE = ['name', 'monthly_cost', 'created_at', 'active_users_count'];
  const sortColumn = SORTABLE.includes(sort_by) ? sort_by : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Compte total SANS filtres
  const total = await Tool.count();

  // Requête avec filtres
  const { count: filtered, rows } = await Tool.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
        where: Object.keys(categoryWhere).length ? categoryWhere : undefined,
        required: Object.keys(categoryWhere).length > 0,
      },
    ],
    order: [[sortColumn, sortOrder]],
    limit: parseInt(limit),
    offset,
    distinct: true, // Nécessaire pour un count correct avec include
  });

  // Construit l'objet filters_applied (ne montre que les filtres utilisés)
  const filters_applied = {};
  if (department) filters_applied.department = department;
  if (status) filters_applied.status = status;
  if (category) filters_applied.category = category;
  if (min_cost) filters_applied.min_cost = parseFloat(min_cost);
  if (max_cost) filters_applied.max_cost = parseFloat(max_cost);

  return {
    data: rows.map(formatTool),
    total,
    filtered,
    page: parseInt(page),
    limit: parseInt(limit),
    filters_applied,
  };
};

/**
 * GET /api/tools/:id — détail complet avec métriques
 */
const getToolById = async (id) => {
  const tool = await Tool.findByPk(id, {
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
  });

  if (!tool) throw notFound(id);

  // Calcul du coût total mensuel
  const total_monthly_cost = parseFloat(
    (parseFloat(tool.monthly_cost) * tool.active_users_count).toFixed(2)
  );

  // Métriques d'usage sur les 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usageStats = await UsageLog.findOne({
    where: {
      tool_id: id,
      session_date: { [Op.gte]: thirtyDaysAgo },
    },
    attributes: [
      [fn('COUNT', col('id')), 'total_sessions'],
      [fn('AVG', col('usage_minutes')), 'avg_session_minutes'],
    ],
    raw: true,
  });

  return {
    ...formatTool(tool),
    total_monthly_cost,
    usage_metrics: {
      last_30_days: {
        total_sessions: parseInt(usageStats?.total_sessions) || 0,
        avg_session_minutes: Math.round(parseFloat(usageStats?.avg_session_minutes) || 0),
      },
    },
  };
};

/**
 * POST /api/tools — création d'un nouvel outil
 */
const createTool = async (data) => {
  // Vérifie que la catégorie existe
  const category = await Category.findByPk(data.category_id);
  if (!category) {
    const err = new Error('Category does not exist');
    err.status = 400;
    err.name = 'SequelizeForeignKeyConstraintError';
    throw err;
  }

  // Vérifie l'unicité du nom
  const existing = await Tool.findOne({ where: { name: data.name } });
  if (existing) {
    const err = new Error('name already exists');
    err.name = 'SequelizeUniqueConstraintError';
    err.errors = [{ path: 'name' }];
    throw err;
  }

  const tool = await Tool.create(data);

  // Recharge avec la relation category pour formater la réponse
  const created = await Tool.findByPk(tool.id, {
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
  });

  return formatTool(created);
};

/**
 * PUT /api/tools/:id — mise à jour partielle d'un outil
 */
const updateTool = async (id, data) => {
  const tool = await Tool.findByPk(id, {
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
  });

  if (!tool) throw notFound(id);

  // Si category_id fourni, vérifie qu'elle existe
  if (data.category_id) {
    const category = await Category.findByPk(data.category_id);
    if (!category) {
      const err = new Error('Category does not exist');
      err.name = 'SequelizeForeignKeyConstraintError';
      throw err;
    }
  }

  // Si nouveau nom fourni, vérifie l'unicité (exclut l'outil courant)
  if (data.name && data.name !== tool.name) {
    const existing = await Tool.findOne({ where: { name: data.name } });
    if (existing) {
      const err = new Error('name already exists');
      err.name = 'SequelizeUniqueConstraintError';
      err.errors = [{ path: 'name' }];
      throw err;
    }
  }

  await tool.update(data);

  // Recharge pour avoir la category à jour
  const updated = await Tool.findByPk(id, {
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
  });

  return formatTool(updated);
};

module.exports = { listTools, getToolById, createTool, updateTool };