const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');
const validate = require('../middlewares/validateMiddleware');
const {
  createAbsenceSchema,
  updateAbsenceStatusSchema,
} = require('../validations/absenceValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Créer une demande d'absence (Employé ou Manager)
router.post(
  '/',
  verifyToken,
  restrictTo('SuperAdmin', 'Manager', 'Employee'),
  validate(createAbsenceSchema),
  absenceController.requestAbsence
);

// Valider ou refuser une demande (Manager / SuperAdmin)
router.patch(
  '/:id/status',
  verifyToken,
  restrictTo('SuperAdmin', 'Manager'),
  validate(updateAbsenceStatusSchema),
  absenceController.changeStatus
);

module.exports = router;
