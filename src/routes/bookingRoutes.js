const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const validate = require('../middlewares/validateMiddleware');
const { createBookingSchema } = require('../validations/bookingValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Créer une réservation (Réservé aux clients, ou aux admins qui font un test)
router.post(
  '/', 
  verifyToken, 
  restrictTo('Customer', 'SuperAdmin'), 
  validate(createBookingSchema), 
  bookingController.createBooking
);

// Récupérer son propre historique de réservations
router.get(
  '/my-bookings', 
  verifyToken, 
  restrictTo('Customer', 'SuperAdmin'), 
  bookingController.getMyBookings
);

// Récupérer TOUTES les réservations (Réservé au staff)
router.get(
  '/', 
  verifyToken, 
  restrictTo('SuperAdmin', 'Manager'), 
  bookingController.getAllBookings
);

// Récupérer les détails d'UNE réservation (Réservé au SuperAdmin et au Staff)
router.get(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin', 'Manager', 'Employee'), 
  bookingController.getBooking
);

router.put(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin', 'Manager', 'Employee', 'Customer'), 
  bookingController.updateBooking
);

// Supprimer une réservation (Réservé uniquement au Grand Patron)
router.delete(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin'), 
  bookingController.deleteBooking
);

module.exports = router;