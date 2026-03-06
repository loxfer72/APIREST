const analyticsService = require('../services/analytics.service');

/**
 * GET /api/analytics/department-costs
 * Répartition des coûts par département
 */
const getDepartmentCosts = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - GET /api/analytics/department-costs`);
    const result = await analyticsService.getDepartmentCosts(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/analytics/expensive-tools
 * Top outils les plus coûteux avec efficiency rating
 */
const getExpensiveTools = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - GET /api/analytics/expensive-tools`);
    const result = await analyticsService.getExpensiveTools(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/analytics/tools-by-category
 * Répartition des outils et coûts par catégorie
 */
const getToolsByCategory = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - GET /api/analytics/tools-by-category`);
    const result = await analyticsService.getToolsByCategory();
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/analytics/low-usage-tools
 * Outils sous-utilisés avec recommandations d'optimisation
 */
const getLowUsageTools = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - GET /api/analytics/low-usage-tools`);
    const result = await analyticsService.getLowUsageTools(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/analytics/vendor-summary
 * Analyse consolidée par fournisseur
 */
const getVendorSummary = async (req, res, next) => {
  try {
    console.info(`[INFO] ${new Date().toISOString()} - GET /api/analytics/vendor-summary`);
    const result = await analyticsService.getVendorSummary();
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getDepartmentCosts,
  getExpensiveTools,
  getToolsByCategory,
  getLowUsageTools,
  getVendorSummary,
};
