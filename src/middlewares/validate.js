/**
 * Middleware usine de validation Joi.
 * Usage : router.post('/', validate(createToolSchema), controller)
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,   // Collecte TOUTES les erreurs, pas seulement la première
    stripUnknown: true,  // Ignore les champs non déclarés dans le schéma
  });

  if (!error) return next();

  // Formate les erreurs Joi en objet { champ: "message" }
  const details = {};
  error.details.forEach((detail) => {
    const key = detail.path.join('.');
    details[key] = detail.message;
  });

  return res.status(400).json({
    error: 'Validation failed',
    details,
  });
};

module.exports = validate;