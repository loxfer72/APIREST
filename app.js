require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger');
const apiRoutes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// ── Middlewares globaux ────────────────────────────────────────────
app.use(express.json());                        // Parse le body JSON
app.use(express.urlencoded({ extended: false })); // Parse les form data
app.use(morgan('dev'));                          // Logs HTTP colorés en dev

// ── Documentation Swagger ──────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Internal Tools API - Docs',
}));

// Expose le fichier OpenAPI brut (utile pour import Postman)
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Routes API ─────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Route 404 pour les endpoints inconnus ──────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// ── Middleware d'erreurs centralisé (DOIT être en dernier) ─────────
app.use(errorHandler);

module.exports = app;