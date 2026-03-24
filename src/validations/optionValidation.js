const Joi = require('joi');

const createOptionSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': "Le nom de l'option est obligatoire.",
    'string.empty': "Le nom ne peut pas être vide."
  }),
  description: Joi.string().optional().allow(''),
  price: Joi.number().min(0).required().messages({
    'number.min': "Le prix ne peut pas être négatif.",
    'any.required': "Le prix est obligatoire."
  }),
  durationMinutes: Joi.number().min(0).required().messages({
    'number.min': "La durée ne peut pas être négative.",
    'any.required': "La durée est obligatoire."
  })
});

const updateOptionSchema = createOptionSchema.fork(
  ['name', 'price', 'durationMinutes'], 
  (schema) => schema.optional()
);

module.exports = { createOptionSchema, updateOptionSchema };