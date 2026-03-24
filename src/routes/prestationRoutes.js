const express = require('express');
const router = express.Router();
const prestationController = require('../controllers/prestationController');
const validate = require('../middlewares/validateMiddleware');
const { createPrestationSchema, updatePrestationSchema } = require('../validations/prestationValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Publique (Site client)
router.get('/', prestationController.getAll);
router.get('/:id', prestationController.getOne);

// Privée (CRM - SuperAdmin)
router.post('/', verifyToken, restrictTo('SuperAdmin'), validate(createPrestationSchema), prestationController.create);
router.put('/:id', verifyToken, restrictTo('SuperAdmin'), validate(updatePrestationSchema), prestationController.update);
router.delete('/:id', verifyToken, restrictTo('SuperAdmin'), prestationController.delete);

module.exports = router;