const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validations/authValidation');

// Routes publiques
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Routes privées (protégées par le token)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;