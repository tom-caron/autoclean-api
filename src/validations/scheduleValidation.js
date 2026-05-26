const Joi = require('joi');

// Regex pour valider le format HH:MM (de 00:00 à 23:59)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const createScheduleSchema = Joi.object({
  employeeId: Joi.string().required(),
  dayOfWeek: Joi.number().min(0).max(6).required(),
  isWorking: Joi.boolean().required(),
  // Si l'employé travaille, startTime et endTime sont obligatoires
  startTime: Joi.string().pattern(timeRegex).when('isWorking', { is: true, then: Joi.required() }),
  endTime: Joi.string().pattern(timeRegex).when('isWorking', { is: true, then: Joi.required() }),
});

const updateScheduleSchema = createScheduleSchema.fork(
  ['employeeId', 'dayOfWeek', 'isWorking', 'startTime', 'endTime'],
  (schema) => schema.optional()
);

module.exports = { createScheduleSchema, updateScheduleSchema };
