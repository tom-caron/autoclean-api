const Joi = require('joi');

const createBookingSchema = Joi.object({
  agencyId: Joi.string().required().messages({ 'any.required': "L'agence est requise." }),
  serviceId: Joi.string().required().messages({ 'any.required': 'La prestation est requise.' }),
  // Les options sont un tableau de chaînes de caractères (les IDs)
  optionIds: Joi.array().items(Joi.string()).optional(),
  // IsoDate vérifie que c'est un format de date valide (ex: "2026-03-25T14:30:00.000Z")
  date: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'La date de réservation doit être dans le futur.',
    'any.required': 'La date est requise.',
  }),
});

// Pour modifier le statut (par un employé ou manager)
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled')
    .required(),
});

module.exports = { createBookingSchema, updateStatusSchema };
