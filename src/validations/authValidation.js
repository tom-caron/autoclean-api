const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.empty': "Le prénom est obligatoire.",
    'string.min': "Le prénom doit faire au moins 2 caractères."
  }),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required().messages({
    'string.email': "Le format de l'email est invalide.",
    'string.empty': "L'email est obligatoire."
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': "Le mot de passe doit contenir au moins 6 caractères.",
    'string.empty': "Le mot de passe est obligatoire."
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': "Le numéro de téléphone doit contenir exactement 10 chiffres.",
    'string.empty': "Le numéro de téléphone est obligatoire."
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': "Le format de l'email est invalide.",
    'string.empty': "L'email est obligatoire."
  }),
  password: Joi.string().required().messages({
    'string.empty': "Le mot de passe ne doit pas être vide.",
    'any.required': "Le mot de passe est obligatoire."
  })
});

module.exports = {
  registerSchema,
  loginSchema
};