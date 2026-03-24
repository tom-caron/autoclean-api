const express = require('express');
const router = express.Router();
const prestationController = require('../controllers/prestationController');
const validate = require('../middlewares/validateMiddleware');
const { createPrestationSchema, updatePrestationSchema } = require('../validations/prestationValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Prestations
 *     description: Catalogue des services de lavage
 */

/**
 * @swagger
 * /api/prestations:
 *   get:
 *     summary: Liste des prestations
 *     tags:
 *       - Prestations
 *     security: []
 *     responses:
 *       200:
 *         description: Succès
 *   post:
 *     summary: Ajouter une prestation (SuperAdmin)
 *     tags:
 *       - Prestations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Lavage Complet
 *               price:
 *                 type: number
 *                 example: 50
 *               durationMinutes:
 *                 type: number
 *                 example: 60
 *     responses:
 *       201:
 *         description: Prestation créée
 */
router.get('/', prestationController.getAll);

/**
 * @swagger
 * /api/prestations/{id}:
 *   get:
 *     summary: Détail d'une prestation
 *     tags:
 *       - Prestations
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès
 *   put:
 *     summary: Modifier une prestation
 *     tags:
 *       - Prestations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prestation modifiée
 *   delete:
 *     summary: Supprimer une prestation
 *     tags:
 *       - Prestations
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
router.get('/:id', prestationController.getOne);

// Privée (CRM - SuperAdmin)
router.post('/', verifyToken, restrictTo('SuperAdmin'), validate(createPrestationSchema), prestationController.create);
router.put('/:id', verifyToken, restrictTo('SuperAdmin'), validate(updatePrestationSchema), prestationController.update);
router.delete('/:id', verifyToken, restrictTo('SuperAdmin'), prestationController.delete);

module.exports = router;