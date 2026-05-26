const Schedule = require('../models/Schedule');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.createOrUpdateSchedule = async (data, currentUser) => {
  // 1. On vérifie que l'employé existe
  const employee = await User.findById(data.employeeId);
  if (!employee || employee.role !== 'Employee') {
    throw new AppError('Employé introuvable ou rôle invalide.', 404);
  }

  // 2. SÉCURITÉ : Le Manager ne gère que son agence
  if (currentUser.role === 'Manager') {
    const manager = await User.findById(currentUser.userId);
    if (manager.agency.toString() !== employee.agency.toString()) {
      throw new AppError('Vous ne pouvez gérer que les employés de votre agence.', 403);
    }
  }

  // 3. Upsert : Met à jour si le jour existe déjà, sinon le crée
  const schedule = await Schedule.findOneAndUpdate(
    { employee: employee._id, dayOfWeek: data.dayOfWeek },
    {
      agency: employee.agency,
      isWorking: data.isWorking,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return schedule;
};

exports.getAgencySchedules = async (agencyId, currentUser) => {
  // SÉCURITÉ : Le Manager ne peut voir que les plannings de son agence
  if (currentUser.role === 'Manager') {
    const manager = await User.findById(currentUser.userId);
    if (manager.agency.toString() !== agencyId.toString()) {
      throw new AppError('Accès refusé pour cette agence.', 403);
    }
  }

  return await Schedule.find({ agency: agencyId })
    .populate('employee', 'firstName lastName email')
    .sort({ employee: 1, dayOfWeek: 1 });
};
