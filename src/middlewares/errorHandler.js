/**
 * Middleware d'erreurs centralisé.
 * Doit être monté EN DERNIER dans app.js (après toutes les routes).
 * Intercepte toutes les erreurs passées via next(error).
 */
const errorHandler = (err, req, res, next) => {
  // Log structuré pour le monitoring
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Erreur Sequelize : violation de contrainte unique (ex: nom déjà pris)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    return res.status(400).json({
      error: 'Validation failed',
      details: { [field]: `${field} already exists` },
    });
  }

  // Erreur Sequelize : clé étrangère introuvable (ex: category_id inexistant)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: { category_id: 'Category does not exist' },
    });
  }

  // Erreur Sequelize : validation ORM échouée
  if (err.name === 'SequelizeValidationError') {
    const details = {};
    err.errors.forEach((e) => { details[e.path] = e.message; });
    return res.status(400).json({ error: 'Validation failed', details });
  }

  // Erreur Sequelize : connexion DB impossible
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Database connection failed',
    });
  }

  // Erreur 404 custom (levée manuellement dans les services)
  if (err.status === 404) {
    return res.status(404).json({
      error: err.error || 'Not found',
      message: err.message,
    });
  }

  // Fallback : erreur serveur générique
  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
};

module.exports = errorHandler;