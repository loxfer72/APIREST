const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internal Tools API',
      version: '1.0.0',
      description:
        'API REST pour la gestion des outils SaaS internes de TechCorp Solutions. ' +
        'Permet de lister, consulter, créer et mettre à jour les outils du catalogue.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Serveur de développement',
      },
    ],
    tags: [
      {
        name: 'Tools',
        description: 'Gestion du catalogue d\'outils SaaS',
      },
    ],
    components: {
      schemas: {
        Tool: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Slack' },
            description: { type: 'string', example: 'Team messaging platform' },
            vendor: { type: 'string', example: 'Slack Technologies' },
            website_url: { type: 'string', example: 'https://slack.com' },
            category: { type: 'string', example: 'Communication' },
            monthly_cost: { type: 'number', example: 8.0 },
            owner_department: { type: 'string', example: 'Engineering' },
            status: { type: 'string', enum: ['active', 'deprecated', 'trial'], example: 'active' },
            active_users_count: { type: 'integer', example: 25 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ToolDetail: {
          allOf: [
            { $ref: '#/components/schemas/Tool' },
            {
              type: 'object',
              properties: {
                total_monthly_cost: { type: 'number', example: 200.0 },
                usage_metrics: {
                  type: 'object',
                  properties: {
                    last_30_days: {
                      type: 'object',
                      properties: {
                        total_sessions: { type: 'integer', example: 127 },
                        avg_session_minutes: { type: 'integer', example: 45 },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        ToolList: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Tool' } },
            total: { type: 'integer', example: 20 },
            filtered: { type: 'integer', example: 15 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            filters_applied: { type: 'object', example: { department: 'Engineering', status: 'active' } },
          },
        },
        ToolCreate: {
          type: 'object',
          required: ['name', 'vendor', 'category_id', 'monthly_cost', 'owner_department'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Linear' },
            description: { type: 'string', example: 'Issue tracking and project management' },
            vendor: { type: 'string', maxLength: 100, example: 'Linear' },
            website_url: { type: 'string', format: 'uri', example: 'https://linear.app' },
            category_id: { type: 'integer', example: 2 },
            monthly_cost: { type: 'number', minimum: 0, example: 8.0 },
            owner_department: {
              type: 'string',
              enum: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design'],
              example: 'Engineering',
            },
          },
        },
        ToolUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            description: { type: 'string' },
            vendor: { type: 'string', maxLength: 100 },
            website_url: { type: 'string', format: 'uri' },
            category_id: { type: 'integer' },
            monthly_cost: { type: 'number', minimum: 0 },
            owner_department: {
              type: 'string',
              enum: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design'],
            },
            status: { type: 'string', enum: ['active', 'deprecated', 'trial'] },
          },
        },
        Error400: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'object',
              example: { name: 'Name is required and must be 2-100 characters' },
            },
          },
        },
        Error404: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Tool not found' },
            message: { type: 'string', example: 'Tool with ID 999 does not exist' },
          },
        },
        Error500: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Internal server error' },
            message: { type: 'string', example: 'Database connection failed' },
          },
        },
      },
    },
  },
  // Chemins où swagger-jsdoc cherche les annotations @swagger
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;