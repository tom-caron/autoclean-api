const Joi = require('joi');

const createAbsenceSchema = Joi.object({
  employeeId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  // La date de fin doit forcément être après la date de début !
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  reason: Joi.string().valid('Vacation', 'Sick', 'Other').optional()
});

const updateAbsenceStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Approved', 'Rejected').required()
});

module.exports = { createAbsenceSchema, updateAbsenceStatusSchema };