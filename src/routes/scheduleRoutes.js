const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const validate = require('../middlewares/validateMiddleware');
const { createScheduleSchema } = require('../validations/scheduleValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Créer ou modifier l'horaire d'un employé (SuperAdmin / Manager)
router.post(
  '/',
  verifyToken,
  restrictTo('SuperAdmin', 'Manager'),
  validate(createScheduleSchema),
  scheduleController.setSchedule
);

// Récupérer tous les horaires d'une agence
router.get(
  '/agency/:agencyId',
  verifyToken,
  restrictTo('SuperAdmin', 'Manager', 'Employee'),
  scheduleController.getSchedules
);

module.exports = router;
