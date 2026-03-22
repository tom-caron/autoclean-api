const agencyService = require('../services/agencyService');

exports.getAllAgencies = async (req, res, next) => {
  try {
    const agencies = await agencyService.getAllAgencies();
    res.status(200).json({
      success: true,
      count: agencies.length,
      data: agencies
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgency = async (req, res, next) => {
  try {
    const agency = await agencyService.getAgencyById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

exports.createAgency = async (req, res, next) => {
  try {
    const newAgency = await agencyService.createAgency(req.body);
    res.status(201).json({
      success: true,
      message: "Agence créée avec succès.",
      data: newAgency
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAgency = async (req, res, next) => {
  try {
    // ➔ On ajoute `req.user` en 3ème paramètre pour le passer au Service !
    const updatedAgency = await agencyService.updateAgency(req.params.id, req.body, req.user);
    
    res.status(200).json({
      success: true,
      message: "Agence mise à jour avec succès.",
      data: updatedAgency
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAgency = async (req, res, next) => {
  try {
    await agencyService.deleteAgency(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Agence supprimée avec succès."
    });
  } catch (error) {
    next(error);
  }
};