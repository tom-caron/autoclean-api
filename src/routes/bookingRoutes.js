const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const validate = require('../middlewares/validateMiddleware');
const { createBookingSchema } = require('../validations/bookingValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Réservations
 *     description: Gestion des rendez-vous et facturations
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Voir toutes les réservations (Staff/Admin)
 *     tags:
 *       - Réservations
 *     responses:
 *       200:
 *         description: Liste filtrée selon le rôle
 *   post:
 *     summary: Créer une réservation (Client)
 *     tags:
 *       - Réservations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agencyId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               optionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-25T14:30:00Z"
 *     responses:
 *       201:
 *         description: Réservation calculée et validée
 */

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Historique du client connecté
 *     tags:
 *       - Réservations
 *     responses:
 *       200:
 *         description: Liste des réservations du client
 */

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Détail d'une réservation (Staff)
 *     tags:
 *       - Réservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails complets
 *   put:
 *     summary: Modifier une réservation
 *     tags:
 *       - Réservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - Pending
 *                   - Confirmed
 *                   - InProgress
 *                   - Completed
 *                   - Cancelled
 *     responses:
 *       200:
 *         description: Détails complets
 *   delete:
 *     summary: Supprimer une réservation (SuperAdmin)
 *     tags:
 *       - Réservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supprimée
 */
router.post(
  '/', 
  verifyToken, 
  restrictTo('Customer', 'SuperAdmin'), 
  validate(createBookingSchema), 
  bookingController.createBooking
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

router.get(
  '/my-bookings', 
  verifyToken, 
  restrictTo('Customer', 'SuperAdmin'), 
  bookingController.getMyBookings
);

// Supprimer une réservation (Réservé uniquement au Grand Patron)
router.delete(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin'), 
  bookingController.deleteBooking
);

module.exports = router;