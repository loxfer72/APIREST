const { Router } = require('express');
const controller = require('../controllers/tool.controller');
const validate = require('../middlewares/validate');
const { createToolSchema, updateToolSchema } = require('../validators/tool.schema');

const router = Router();

/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: Liste tous les outils avec filtres optionnels
 *     tags: [Tools]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema: { type: string, enum: [Engineering, Sales, Marketing, HR, Finance, Operations, Design] }
 *         description: Filtrer par département
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, deprecated, trial] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filtrer par nom de catégorie
 *       - in: query
 *         name: min_cost
 *         schema: { type: number }
 *       - in: query
 *         name: max_cost
 *         schema: { type: number }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort_by
 *         schema: { type: string, enum: [name, monthly_cost, created_at, active_users_count], default: created_at }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *     responses:
 *       200:
 *         description: Liste des outils
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ToolList' }
 *       500:
 *         description: Erreur serveur
 */
router.get('/', controller.listTools);

/**
 * @swagger
 * /api/tools/{id}:
 *   get:
 *     summary: Détail complet d'un outil avec métriques d'usage
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détail de l'outil
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ToolDetail' }
 *       404:
 *         description: Outil introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error404' }
 */
router.get('/:id', controller.getToolById);

/**
 * @swagger
 * /api/tools:
 *   post:
 *     summary: Créer un nouvel outil
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ToolCreate' }
 *     responses:
 *       201:
 *         description: Outil créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tool' }
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error400' }
 */
router.post('/', validate(createToolSchema), controller.createTool);

/**
 * @swagger
 * /api/tools/{id}:
 *   put:
 *     summary: Mettre à jour un outil existant
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ToolUpdate' }
 *     responses:
 *       200:
 *         description: Outil mis à jour
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tool' }
 *       404:
 *         description: Outil introuvable
 *       400:
 *         description: Données invalides
 */
router.put('/:id', validate(updateToolSchema), controller.updateTool);

module.exports = router;