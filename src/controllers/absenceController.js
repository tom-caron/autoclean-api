const absenceService = require('../services/absenceService');

exports.requestAbsence = async (req, res, next) => {
  try {
    const absence = await absenceService.createAbsence(req.body, req.user);
    res.status(201).json({ success: true, data: absence });
  } catch (error) {
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const absence = await absenceService.updateAbsenceStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({ success: true, data: absence });
  } catch (error) {
    next(error);
  }
};