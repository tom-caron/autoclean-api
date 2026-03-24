const Joi = require('joi');

const createAgencySchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': "Le nom de l'agence est obligatoire.",
    'any.required': "Le champ nom est requis."
  }),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    zipCode: Joi.string().required()
  }).required(),
  phone: Joi.string().required(),
  // Validation complexe pour les horaires !
  openingHours: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().min(0).max(6).required(),
      isOpen: Joi.boolean().required(),
      openTime: Joi.string().allow(null, ''), // Autorise null ou vide si fermé
      closeTime: Joi.string().allow(null, '')
    })
  ).optional() // Les horaires sont optionnels à la création
});

// Tu peux aussi créer un schéma pour l'update (où tous les champs sont optionnels)
const updateAgencySchema = createAgencySchema.fork(
  ['name', 'address', 'phone'], 
  (schema) => schema.optional()
);

module.exports = {
  createAgencySchema,
  updateAgencySchema
};