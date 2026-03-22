const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware'); // On importe le vigile !

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes privées (protégées par le token)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;