const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validations/authValidation');

/**
 * @swagger
 * tags:
 *   - name: Authentification
 *     description: Gestion des utilisateurs et de la connexion
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscrire un nouveau client
 *     tags:
 *       - Authentification
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john@test.com
 *               password:
 *                 type: string
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: "0600000000"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags:
 *       - Authentification
 *     description: Permet à un client ou membre du staff de se connecter.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@autoclean.fr
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie le token.
 *       400:
 *         description: Erreur de validation (champs manquants).
 *       401:
 *         description: Email ou mot de passe incorrect.
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil connecté
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Données de l'utilisateur
 */
router.get('/me', verifyToken, authController.getMe);

module.exports = router;