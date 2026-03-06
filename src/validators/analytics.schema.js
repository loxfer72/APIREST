const Joi = require('joi');

// Schéma pour GET /api/analytics/department-costs
const departmentCostsSchema = Joi.object({
  sort_by: Joi.string()
    .valid('total_cost', 'department', 'tools_count', 'total_users')
    .optional()
    .messages({ 'any.only': 'sort_by must be one of: total_cost, department, tools_count, total_users' }),

  order: Joi.string()
    .valid('asc', 'desc', 'ASC', 'DESC')
    .optional()
    .messages({ 'any.only': 'order must be ASC or DESC' }),
});

// Schéma pour GET /api/analytics/expensive-tools
const expensiveToolsSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.min': 'Must be positive integer between 1 and 100',
      'number.max': 'Must be positive integer between 1 and 100',
      'number.base': 'Must be positive integer between 1 and 100',
    }),

  min_cost: Joi.number()
    .min(0)
    .optional()
    .messages({ 'number.min': 'min_cost must be a positive number' }),
});

// Schéma pour GET /api/analytics/low-usage-tools
const lowUsageToolsSchema = Joi.object({
  max_users: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({ 'number.min': 'max_users must be a positive integer' }),
});

module.exports = { departmentCostsSchema, expensiveToolsSchema, lowUsageToolsSchema };
