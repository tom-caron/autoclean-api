const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createAgencySchema, updateAgencySchema } = require('../validations/agencyValidation');

/**
 * @swagger
 * tags:
 *   - name: Agences
 *     description: Gestion des centres de lavage
 */

/**
 * @swagger
 * /api/agencies:
 *   get:
 *     summary: Récupérer toutes les agences
 *     tags:
 *       - Agences
 *     security: []
 *     responses:
 *       200:
 *         description: Liste des agences
 *   post:
 *     summary: Créer une agence (SuperAdmin)
 *     tags:
 *       - Agences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Autoclean Paris
 *               phone:
 *                 type: string
 *                 example: "0100000000"
 *     responses:
 *       201:
 *         description: Agence créée
 */
router.get('/', agencyController.getAllAgencies);

/**
 * @swagger
 * /api/agencies/{id}:
 *   get:
 *     summary: Récupérer une agence
 *     tags:
 *       - Agences
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'agence
 *   put:
 *     summary: Modifier une agence (SuperAdmin/Manager)
 *     tags:
 *       - Agences
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Autoclean Paris Modifié
 *     responses:
 *       200:
 *         description: Agence modifiée
 *   delete:
 *     summary: Supprimer une agence (SuperAdmin)
 *     tags:
 *       - Agences
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agence supprimée
 */
router.get('/:id', agencyController.getAgency);

router.post(
  '/',
  verifyToken,
  restrictTo('SuperAdmin'),
  validate(createAgencySchema),
  agencyController.createAgency
);

router.put(
  '/:id',
  verifyToken,
  restrictTo('SuperAdmin', 'Manager'),
  validate(updateAgencySchema),
  agencyController.updateAgency
);

router.delete('/:id', verifyToken, restrictTo('SuperAdmin'), agencyController.deleteAgency);

module.exports = router;
