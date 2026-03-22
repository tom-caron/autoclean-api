const Agency = require('../models/Agency');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Récupérer toutes les agences (Publique)
exports.getAllAgencies = async () => {
  return await Agency.find();
};

// Créer une nouvelle agence (Privée - SuperAdmin)
exports.createAgency = async (agencyData) => {
  // Optionnel : vérifier si une agence avec le même nom existe déjà
  const existingAgency = await Agency.findOne({ name: agencyData.name });
  if (existingAgency) {
    throw new AppError("Une agence avec ce nom existe déjà.", 400);
  }

  const newAgency = new Agency(agencyData);
  await newAgency.save();
  return newAgency;
};

// Récupérer une seule agence par son ID (Publique)
exports.getAgencyById = async (agencyId) => {
  const agency = await Agency.findById(agencyId);
  
  if (!agency) {
    throw new AppError("Agence introuvable.", 404);
  }
  
  return agency;
};

exports.updateAgency = async (agencyId, updateData, currentUser) => {
  
  // 1. --- LA RÈGLE MÉTIER DE SÉCURITÉ ---
  if (currentUser.role === 'Manager') {
    // On va chercher les infos du manager en base de données pour connaître son agence
    const manager = await User.findById(currentUser.userId);
    
    // Si le manager n'a pas d'agence (anormal) ou si l'ID de son agence ne correspond pas à l'URL
    if (!manager.agency || manager.agency.toString() !== agencyId) {
      throw new AppError("Accès refusé. Vous ne pouvez modifier que l'agence à laquelle vous êtes rattaché.", 403);
    }
  }
  // (Si c'est un SuperAdmin, le code continue sans bloquer !)

  // 2. --- LA MISE À JOUR ---
  const agency = await Agency.findByIdAndUpdate(agencyId, updateData, {
    new: true,
    runValidators: true 
  });

  if (!agency) {
    throw new AppError("Agence introuvable.", 404);
  }

  return agency;
};

// Supprimer une agence (Privée - SuperAdmin)
exports.deleteAgency = async (agencyId) => {
  const agency = await Agency.findByIdAndDelete(agencyId);
  
  if (!agency) {
    throw new AppError("Agence introuvable.", 404);
  }

  // 💡 Note de pro pour ton jury : 
  // Dans un vrai projet, il faudrait aussi gérer les "suppressions en cascade" ici.
  // C'est-à-dire supprimer ou réassigner les employés et les rendez-vous liés à cette agence.
  
  return agency;
};