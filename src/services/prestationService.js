const ServiceModel = require('../models/Service'); // On importe bien ton modèle Service.js
const AppError = require('../utils/AppError');

exports.getAllPrestations = async () => {
  return await ServiceModel.find();
};

exports.getPrestationById = async (id) => {
  const prestation = await ServiceModel.findById(id);
  if (!prestation) throw new AppError('Prestation introuvable.', 404);
  return prestation;
};

exports.createPrestation = async (data) => {
  const newPrestation = new ServiceModel(data);
  await newPrestation.save();
  return newPrestation;
};

exports.updatePrestation = async (id, data) => {
  const prestation = await ServiceModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!prestation) throw new AppError('Prestation introuvable.', 404);
  return prestation;
};

exports.deletePrestation = async (id) => {
  const prestation = await ServiceModel.findByIdAndDelete(id);
  if (!prestation) throw new AppError('Prestation introuvable.', 404);
  return prestation;
};
