const { Router } = require('express');
const toolsRoutes = require('./tools.routes');

const router = Router();

// Monte le router tools sur /api/tools
router.use('/tools', toolsRoutes);

module.exports = router;