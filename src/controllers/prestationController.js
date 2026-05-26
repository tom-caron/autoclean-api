const prestationService = require('../services/prestationService');

exports.getAll = async (req, res, next) => {
  try {
    const prestations = await prestationService.getAllPrestations();
    res.status(200).json({ success: true, count: prestations.length, data: prestations });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const prestation = await prestationService.getPrestationById(req.params.id);
    res.status(200).json({ success: true, data: prestation });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const prestation = await prestationService.createPrestation(req.body);
    res.status(201).json({ success: true, message: 'Prestation créée.', data: prestation });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const prestation = await prestationService.updatePrestation(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Prestation modifiée.', data: prestation });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await prestationService.deletePrestation(req.params.id);
    res.status(200).json({ success: true, message: 'Prestation supprimée.' });
  } catch (error) {
    next(error);
  }
};
