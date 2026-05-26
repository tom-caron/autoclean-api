const optionService = require('../services/optionService');

exports.getAll = async (req, res, next) => {
  try {
    const options = await optionService.getAllOptions();
    res.status(200).json({ success: true, count: options.length, data: options });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const option = await optionService.getOptionById(req.params.id);
    res.status(200).json({ success: true, data: option });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const option = await optionService.createOption(req.body);
    res.status(201).json({ success: true, message: 'Option créée.', data: option });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const option = await optionService.updateOption(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Option modifiée.', data: option });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await optionService.deleteOption(req.params.id);
    res.status(200).json({ success: true, message: 'Option supprimée.' });
  } catch (error) {
    next(error);
  }
};
