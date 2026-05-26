const Absence = require('../models/Absence');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.createAbsence = async (data, currentUser) => {
  const employee = await User.findById(data.employeeId);
  if (!employee) throw new AppError('Employé introuvable.', 404);

  // SÉCURITÉ : Un employé ne peut faire une demande que pour LUI-MÊME.
  // Un Manager ne peut faire une demande que pour les employés de SON agence.
  if (currentUser.role === 'Employee' && currentUser.userId !== data.employeeId) {
    throw new AppError('Vous ne pouvez demander des congés que pour vous-même.', 403);
  } else if (currentUser.role === 'Manager') {
    const manager = await User.findById(currentUser.userId);
    if (manager.agency.toString() !== employee.agency.toString()) {
      throw new AppError("Cet employé n'appartient pas à votre agence.", 403);
    }
  }

  const newAbsence = new Absence({
    employee: data.employeeId,
    agency: employee.agency,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason || 'Other',
    // Si c'est le Manager qui crée l'absence, elle est validée d'office !
    status: currentUser.role === 'Employee' ? 'Pending' : 'Approved',
  });

  return await newAbsence.save();
};

exports.updateAbsenceStatus = async (id, status, currentUser) => {
  const absence = await Absence.findById(id);
  if (!absence) throw new AppError('Absence introuvable.', 404);

  // SÉCURITÉ : Le Manager vérifie qu'il gère bien cette agence
  if (currentUser.role === 'Manager') {
    const manager = await User.findById(currentUser.userId);
    if (manager.agency.toString() !== absence.agency.toString()) {
      throw new AppError('Accès refusé pour cette agence.', 403);
    }
  }

  absence.status = status;
  return await absence.save();
};
