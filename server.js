require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const start = async () => {
  // Teste la connexion DB avant d'écouter les requêtes
  await testConnection();

  app.listen(PORT, () => {
    console.info(`[INFO] Serveur démarré sur http://localhost:${PORT}`);
    console.info(`[INFO] Documentation Swagger : http://localhost:${PORT}/api/docs`);
  });
};

start();