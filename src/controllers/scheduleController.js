const scheduleService = require('../services/scheduleService');

exports.setSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleService.createOrUpdateSchedule(req.body, req.user);
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

exports.getSchedules = async (req, res, next) => {
  try {
    const schedules = await scheduleService.getAgencySchedules(req.params.agencyId, req.user);
    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (error) {
    next(error);
  }
};
