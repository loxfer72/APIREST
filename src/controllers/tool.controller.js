const toolService = require('../services/tool.service');

/**
 * GET /api/tools
 * Liste tous les outils avec filtres, pagination et tri optionnels
 */
const listTools = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - GET /api/tools - filters: ${JSON.stringify(req.query)}`);
    const result = await toolService.listTools(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tools/:id
 * Retourne le détail complet d'un outil avec ses métriques d'usage
 */
const getToolById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Vérifie que l'ID est un entier valide
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { id: 'ID must be a positive integer' },
      });
    }

    console.info(`[INFO] ${new Date().toISOString()} - GET /api/tools/${id}`);
    const tool = await toolService.getToolById(id);
    return res.status(200).json(tool);
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/tools
 * Crée un nouvel outil (données validées en amont par le middleware validate)
 */
const createTool = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - POST /api/tools - body: ${JSON.stringify(req.body)}`);
    const tool = await toolService.createTool(req.body);
    return res.status(201).json(tool);
  } catch (err) {
    return next(err);
  }
};

/**
 * PUT /api/tools/:id
 * Met à jour un outil existant (mise à jour partielle)
 */
const updateTool = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { id: 'ID must be a positive integer' },
      });
    }

    console.info(`[INFO] ${new Date().toISOString()} - PUT /api/tools/${id} - body: ${JSON.stringify(req.body)}`);
    const tool = await toolService.updateTool(id, req.body);
    return res.status(200).json(tool);
  } catch (err) {
    return next(err);
  }
};

module.exports = { listTools, getToolById, createTool, updateTool };