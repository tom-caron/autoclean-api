const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

router.get('/', agencyController.getAllAgencies);

router.get('/:id', agencyController.getAgency);

router.post(
  '/', 
  verifyToken, 
  restrictTo('SuperAdmin'), 
  agencyController.createAgency
);

router.put(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin', 'Manager'), 
  agencyController.updateAgency
);

router.delete(
  '/:id', 
  verifyToken, 
  restrictTo('SuperAdmin'), 
  agencyController.deleteAgency
);

module.exports = router;