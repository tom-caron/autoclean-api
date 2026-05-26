const Option = require('../models/ServiceOption');
const AppError = require('../utils/AppError');

exports.getAllOptions = async () => {
  return await Option.find();
};

exports.getOptionById = async (id) => {
  const option = await Option.findById(id);
  if (!option) throw new AppError('Option introuvable.', 404);
  return option;
};

exports.createOption = async (data) => {
  const newOption = new Option(data);
  await newOption.save();
  return newOption;
};

exports.updateOption = async (id, data) => {
  const option = await Option.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!option) throw new AppError('Option introuvable.', 404);
  return option;
};

exports.deleteOption = async (id) => {
  const option = await Option.findByIdAndDelete(id);
  if (!option) throw new AppError('Option introuvable.', 404);
  return option;
};
