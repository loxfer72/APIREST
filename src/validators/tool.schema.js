const Joi = require('joi');

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
  'Design',
];

const STATUSES = ['active', 'deprecated', 'trial'];

// Schéma pour la création d'un outil (POST)
const createToolSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be between 2 and 100 characters',
    'string.max': 'Name must be between 2 and 100 characters',
    'any.required': 'Name is required and must be 2-100 characters',
    'string.empty': 'Name is required and must be 2-100 characters',
  }),

  description: Joi.string().max(1000).optional().allow('', null),

  vendor: Joi.string().max(100).required().messages({
    'any.required': 'Vendor is required',
    'string.empty': 'Vendor is required',
    'string.max': 'Vendor must be at most 100 characters',
  }),

  website_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('', null)
    .messages({
      'string.uri': 'Must be a valid URL format',
    }),

  category_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Category ID is required',
    'number.base': 'Category ID must be a number',
  }),

  monthly_cost: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'any.required': 'Monthly cost is required',
      'number.min': 'Must be a positive number',
      'number.base': 'Must be a positive number',
    }),

  owner_department: Joi.string()
    .valid(...DEPARTMENTS)
    .required()
    .messages({
      'any.required': 'Owner department is required',
      'any.only': `Must be one of: ${DEPARTMENTS.join(', ')}`,
    }),

  status: Joi.string()
    .valid(...STATUSES)
    .optional()
    .messages({
      'any.only': `Status must be one of: ${STATUSES.join(', ')}`,
    }),
});

// Schéma pour la mise à jour d'un outil (PUT) — tous les champs optionnels
const updateToolSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be between 2 and 100 characters',
    'string.max': 'Name must be between 2 and 100 characters',
  }),

  description: Joi.string().max(1000).optional().allow('', null),

  vendor: Joi.string().max(100).optional().messages({
    'string.max': 'Vendor must be at most 100 characters',
  }),

  website_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('', null)
    .messages({
      'string.uri': 'Must be a valid URL format',
    }),

  category_id: Joi.number().integer().positive().optional(),

  monthly_cost: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .messages({
      'number.min': 'Must be a positive number',
      'number.base': 'Must be a positive number',
    }),

  owner_department: Joi.string()
    .valid(...DEPARTMENTS)
    .optional()
    .messages({
      'any.only': `Must be one of: ${DEPARTMENTS.join(', ')}`,
    }),

  status: Joi.string()
    .valid(...STATUSES)
    .optional()
    .messages({
      'any.only': `Status must be one of: ${STATUSES.join(', ')}`,
    }),

  active_users_count: Joi.number().integer().min(0).optional(),
})
  .min(1) // Au moins un champ requis pour un PUT
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

module.exports = { createToolSchema, updateToolSchema };