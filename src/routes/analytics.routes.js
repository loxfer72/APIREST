const { Router } = require('express');
const controller = require('../controllers/analytics.controller');
const validate = require('../middlewares/validate');
const {
  departmentCostsSchema,
  expensiveToolsSchema,
  lowUsageToolsSchema,
} = require('../validators/analytics.schema');

// Middleware adapté pour valider les query params (et non le body)
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (!error) return next();

  const details = {};
  error.details.forEach((d) => { details[d.path.join('.')] = d.message; });

  return res.status(400).json({ error: 'Invalid analytics parameter', details });
};

const router = Router();

/**
 * @swagger
 * /api/analytics/department-costs:
 *   get:
 *     summary: Répartition des coûts par département
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: sort_by
 *         schema: { type: string, enum: [total_cost, department, tools_count, total_users], default: total_cost }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *     responses:
 *       200:
 *         description: Répartition des coûts par département
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DepartmentCosts' }
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorAnalytics400' }
 */
router.get('/department-costs', validateQuery(departmentCostsSchema), controller.getDepartmentCosts);

/**
 * @swagger
 * /api/analytics/expensive-tools:
 *   get:
 *     summary: Top outils les plus coûteux avec efficiency rating
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         description: Nombre maximum d'outils à retourner
 *       - in: query
 *         name: min_cost
 *         schema: { type: number, minimum: 0 }
 *         description: Coût mensuel minimum
 *     responses:
 *       200:
 *         description: Top outils coûteux avec analyse d'efficacité
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ExpensiveTools' }
 *       400:
 *         description: Paramètres invalides
 */
router.get('/expensive-tools', validateQuery(expensiveToolsSchema), controller.getExpensiveTools);

/**
 * @swagger
 * /api/analytics/tools-by-category:
 *   get:
 *     summary: Répartition des outils et coûts par catégorie
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Répartition par catégorie avec insights
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ToolsByCategory' }
 */
router.get('/tools-by-category', controller.getToolsByCategory);

/**
 * @swagger
 * /api/analytics/low-usage-tools:
 *   get:
 *     summary: Outils sous-utilisés avec recommandations d'économies
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: max_users
 *         schema: { type: integer, minimum: 0, default: 5 }
 *         description: Seuil maximum d'utilisateurs actifs
 *     responses:
 *       200:
 *         description: Outils sous-utilisés avec analyse des économies potentielles
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LowUsageTools' }
 */
router.get('/low-usage-tools', validateQuery(lowUsageToolsSchema), controller.getLowUsageTools);

/**
 * @swagger
 * /api/analytics/vendor-summary:
 *   get:
 *     summary: Analyse consolidée par fournisseur
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Résumé des coûts et efficacité par vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VendorSummary' }
 */
router.get('/vendor-summary', controller.getVendorSummary);

module.exports = router;
