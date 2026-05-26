const Joi = require('joi');

const createPrestationSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Le nom de la prestation est obligatoire.',
    'string.empty': 'Le nom de la prestation ne peut pas être vide.',
  }),
  description: Joi.string().optional().allow(''),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Le prix ne peut pas être négatif.',
    'any.required': 'Le prix est obligatoire.',
  }),
  durationMinutes: Joi.number().min(5).required().messages({
    'number.min': "La durée doit être d'au moins 5 minutes.",
    'any.required': 'La durée est obligatoire.',
  }),
});

const updatePrestationSchema = createPrestationSchema.fork(
  ['name', 'price', 'durationMinutes'],
  (schema) => schema.optional()
);

module.exports = { createPrestationSchema, updatePrestationSchema };
