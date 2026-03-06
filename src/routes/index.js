const { Router } = require('express');
const toolsRoutes = require('./tools.routes');
const analyticsRoutes = require('./analytics.routes');

const router = Router();

// Monte le router tools sur /api/tools
router.use('/tools', toolsRoutes);

// Monte le router analytics sur /api/analytics
router.use('/analytics', analyticsRoutes);

module.exports = router;
