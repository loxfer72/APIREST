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
      { name: 'Tools', description: "Gestion du catalogue d'outils SaaS" },
      { name: 'Analytics', description: 'Analytics et reporting pour optimisation des coûts' },
    ],
    components: {
      schemas: {
        // ─── TOOLS (Part 1) ───
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
            details: { type: 'object', example: { name: 'Name is required and must be 2-100 characters' } },
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

        // ─── ANALYTICS (Part 2) ───
        DepartmentCostItem: {
          type: 'object',
          properties: {
            department: { type: 'string', example: 'Engineering' },
            total_cost: { type: 'number', example: 890.50 },
            tools_count: { type: 'integer', example: 12 },
            total_users: { type: 'integer', example: 45 },
            average_cost_per_tool: { type: 'number', example: 74.21 },
            cost_percentage: { type: 'number', example: 36.2 },
          },
        },
        DepartmentCosts: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/DepartmentCostItem' } },
            summary: {
              type: 'object',
              properties: {
                total_company_cost: { type: 'number', example: 2450.80 },
                departments_count: { type: 'integer', example: 6 },
                most_expensive_department: { type: 'string', example: 'Engineering' },
              },
            },
          },
        },
        ExpensiveToolItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 15 },
            name: { type: 'string', example: 'Enterprise CRM' },
            monthly_cost: { type: 'number', example: 199.99 },
            active_users_count: { type: 'integer', example: 12 },
            cost_per_user: { type: 'number', example: 16.67 },
            department: { type: 'string', example: 'Sales' },
            vendor: { type: 'string', example: 'BigCorp' },
            efficiency_rating: { type: 'string', enum: ['excellent', 'good', 'average', 'low'] },
          },
        },
        ExpensiveTools: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/ExpensiveToolItem' } },
            analysis: {
              type: 'object',
              properties: {
                total_tools_analyzed: { type: 'integer', example: 18 },
                avg_cost_per_user_company: { type: 'number', example: 12.45 },
                potential_savings_identified: { type: 'number', example: 345.50 },
              },
            },
          },
        },
        ToolsByCategoryItem: {
          type: 'object',
          properties: {
            category_name: { type: 'string', example: 'Development' },
            tools_count: { type: 'integer', example: 8 },
            total_cost: { type: 'number', example: 650.00 },
            total_users: { type: 'integer', example: 67 },
            percentage_of_budget: { type: 'number', example: 26.5 },
            average_cost_per_user: { type: 'number', example: 9.70 },
          },
        },
        ToolsByCategory: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/ToolsByCategoryItem' } },
            insights: {
              type: 'object',
              properties: {
                most_expensive_category: { type: 'string', example: 'Development' },
                most_efficient_category: { type: 'string', example: 'Communication' },
              },
            },
          },
        },
        LowUsageToolItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 23 },
            name: { type: 'string', example: 'Specialized Analytics' },
            monthly_cost: { type: 'number', example: 89.99 },
            active_users_count: { type: 'integer', example: 2 },
            cost_per_user: { type: 'number', example: 45.00 },
            department: { type: 'string', example: 'Marketing' },
            vendor: { type: 'string', example: 'SmallVendor' },
            warning_level: { type: 'string', enum: ['high', 'medium', 'low'] },
            potential_action: { type: 'string', example: 'Consider canceling or downgrading' },
          },
        },
        LowUsageTools: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/LowUsageToolItem' } },
            savings_analysis: {
              type: 'object',
              properties: {
                total_underutilized_tools: { type: 'integer', example: 5 },
                potential_monthly_savings: { type: 'number', example: 287.50 },
                potential_annual_savings: { type: 'number', example: 3450.00 },
              },
            },
          },
        },
        VendorSummaryItem: {
          type: 'object',
          properties: {
            vendor: { type: 'string', example: 'Google' },
            tools_count: { type: 'integer', example: 4 },
            total_monthly_cost: { type: 'number', example: 234.50 },
            total_users: { type: 'integer', example: 67 },
            departments: { type: 'string', example: 'Engineering,Marketing,Sales' },
            average_cost_per_user: { type: 'number', example: 3.50 },
            vendor_efficiency: { type: 'string', enum: ['excellent', 'good', 'average', 'poor'] },
          },
        },
        VendorSummary: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/VendorSummaryItem' } },
            vendor_insights: {
              type: 'object',
              properties: {
                most_expensive_vendor: { type: 'string', example: 'BigCorp' },
                most_efficient_vendor: { type: 'string', example: 'Google' },
                single_tool_vendors: { type: 'integer', example: 8 },
              },
            },
          },
        },
        ErrorAnalytics400: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Invalid analytics parameter' },
            details: { type: 'object', example: { limit: 'Must be positive integer between 1 and 100' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
