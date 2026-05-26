const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');
const validate = require('../middlewares/validateMiddleware');
const { createOptionSchema, updateOptionSchema } = require('../validations/optionValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Options
 *     description: Catalogue des services de lavage
 */

/**
 * @swagger
 * /api/options:
 *   get:
 *     summary: Liste des Options
 *     tags:
 *       - Options
 *     security: []
 *     responses:
 *       200:
 *         description: Succès
 *   post:
 *     summary: Ajouter une prestation (SuperAdmin)
 *     tags:
 *       - Options
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
router.get('/', optionController.getAll);

/**
 * @swagger
 * /api/options/{id}:
 *   get:
 *     summary: Détail d'une prestation
 *     tags:
 *       - Options
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
 *       - Options
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
 *       - Options
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
router.get('/:id', optionController.getOne);

router.post(
  '/',
  verifyToken,
  restrictTo('SuperAdmin'),
  validate(createOptionSchema),
  optionController.create
);
router.put(
  '/:id',
  verifyToken,
  restrictTo('SuperAdmin'),
  validate(updateOptionSchema),
  optionController.update
);
router.delete('/:id', verifyToken, restrictTo('SuperAdmin'), optionController.delete);

module.exports = router;
