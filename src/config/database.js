const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false, // Passer à console.log pour débugger les requêtes SQL
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  }
);

// Test de connexion au démarrage
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.info('[DB] Connexion MySQL établie avec succès');
  } catch (error) {
    console.error('[DB] Impossible de se connecter à la base de données:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };