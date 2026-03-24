const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');
const validate = require('../middlewares/validateMiddleware');
const { createOptionSchema, updateOptionSchema } = require('../validations/optionValidation');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

router.get('/', optionController.getAll);
router.get('/:id', optionController.getOne);

router.post('/', verifyToken, restrictTo('SuperAdmin'), validate(createOptionSchema), optionController.create);
router.put('/:id', verifyToken, restrictTo('SuperAdmin'), validate(updateOptionSchema), optionController.update);
router.delete('/:id', verifyToken, restrictTo('SuperAdmin'), optionController.delete);

module.exports = router;