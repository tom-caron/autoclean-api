const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createAgencySchema, updateAgencySchema } = require('../validations/agencyValidation');

router.get('/', agencyController.getAllAgencies);

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

router.delete(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin'), 
  agencyController.deleteAgency
);

module.exports = router;