const Booking = require('../models/Booking');
const ServiceModel = require('../models/Service');
const Option = require('../models/ServiceOption');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Absence = require('../models/Absence');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// Récupérer toutes les réservations (avec filtre optionnel)
exports.getAllBookings = async (currentUser) => {
  let filter = {};
  
  // ➔ RÈGLE MÉTIER : Cloisonnement pour le Manager
  if (currentUser && (currentUser.role === 'Manager' || currentUser.role === 'Employee')) {
    const manager = await User.findById(currentUser.userId);
    filter.agency = manager.agency;
  }

  return await Booking.find(filter)
    .populate('customer', 'firstName lastName email phone')
    .populate('agency', 'name')
    .populate('service', 'name')
    .sort({ date: -1 });
};

// Récupérer une seule réservation par son ID
exports.getBookingById = async (id, currentUser) => {
  const booking = await Booking.findById(id)
    .populate('customer', 'firstName lastName email phone')
    .populate('agency', 'name address')
    .populate('service', 'name price durationMinutes')
    .populate('options', 'name price durationMinutes');
    
  if (!booking) throw new AppError("Réservation introuvable.", 404);
  
  // ➔ RÈGLE MÉTIER : Vérification d'accès
  if (currentUser && ['Manager', 'Employee'].includes(currentUser.role)) {
    const staffMember = await User.findById(currentUser.userId);
    if (booking.agency._id.toString() !== staffMember.agency.toString()) {
      throw new AppError("Accès refusé. Cette réservation n'appartient pas à votre agence.", 403);
    }
  }
  
  return booking;
};

exports.createBooking = async (customerId, bookingData) => {
  const { agencyId, serviceId, optionIds, date } = bookingData;

  // 1. Récupérer la prestation pour avoir son vrai prix et sa durée
  const service = await ServiceModel.findById(serviceId);
  if (!service) throw new AppError("Prestation introuvable.", 404);

  let totalPrice = service.price;
  let totalDuration = service.durationMinutes;

  // 2. Si le client a choisi des options, on les additionne
  if (optionIds && optionIds.length > 0) {
    const options = await Option.find({ _id: { $in: optionIds } });
    if (options.length !== optionIds.length) {
      throw new AppError("Une ou plusieurs options sont invalides.", 400);
    }
    options.forEach(opt => {
      totalPrice += opt.price;
      totalDuration += opt.durationMinutes;
    });
  }

  // ➔ NOUVEAU : 3. Vérification de la disponibilité avec notre algorithme !
  const isAvailable = await checkAvailability(agencyId, date, totalDuration);
  if (!isAvailable) {
    throw new AppError("Désolé, aucun créneau n'est disponible à cette heure précise.", 409); // 409 Conflict
  }

  // 4. Création de la réservation avec les montants sécurisés
  const newBooking = new Booking({
    customer: customerId,
    agency: agencyId,
    service: serviceId,
    options: optionIds || [],
    date,
    totalPrice,
    totalDurationMinutes: totalDuration
  });

  await newBooking.save();
  return newBooking;
};

// Récupérer les réservations d'un client spécifique
exports.getCustomerBookings = async (customerId) => {
  return await Booking.find({ customer: customerId })
    .populate('agency', 'name address') // On ramène juste le nom et l'adresse de l'agence
    .populate('service', 'name price')
    .sort({ date: 1 }); // Tri chronologique
};

// Mettre à jour une réservation
exports.updateBooking = async (id, updateData, currentUser) => {
  // 1. On vérifie d'abord que la réservation existe
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError("Réservation introuvable.", 404);

  // 2. RÈGLE MÉTIER : Vérification des droits et de la règle des 48h
  if (currentUser) {
    // Si c'est un client qui fait la requête
    if (currentUser.role === 'Customer' || currentUser.role.name === 'Customer') {
      
      // A. Vérification de propriété
      if (booking.customer._id.toString() !== currentUser.userId) {
        throw new AppError("Vous ne pouvez modifier que vos propres réservations.", 403);
      }

      // B. La fameuse règle des 48h (Anti-abus)
      const now = new Date();
      const bookingDate = new Date(booking.date);
      const timeDifferenceInHours = (bookingDate - now) / (1000 * 60 * 60);

      if (timeDifferenceInHours < 48) {
        throw new AppError("Les modifications ou annulations ne sont possibles que 48h à l'avance. Veuillez contacter l'agence.", 403);
      }

      // C. Sécurité : On empêche le client de modifier son prix ou de s'auto-valider !
      // Le client ne peut envoyer qu'une demande d'annulation ('Cancelled') ou un changement de date.
      const allowedUpdates = {};
      if (updateData.status === 'Cancelled') allowedUpdates.status = 'Cancelled';
      if (updateData.date) allowedUpdates.date = updateData.date;
      
      updateData = allowedUpdates; // On écrase les données avec uniquement ce qui est permis
    } 
    // Si c'est le Staff
    else if (['Manager', 'Employee'].includes(currentUser.role?.name || currentUser.role)) {
      const staffMember = await User.findById(currentUser.userId);
      if (booking.agency._id.toString() !== staffMember.agency.toString()) {
        throw new AppError("Vous ne pouvez modifier que les réservations de votre agence.", 403);
      }
    }
  }

  // 3. Application de la mise à jour
  const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });
  
  return updatedBooking;
};

// Supprimer une réservation (Hard delete)
exports.deleteBooking = async (id) => {
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) throw new AppError("Réservation introuvable.", 404);
  return booking;
};

// L'algorithme de calcul des disponibilités
const checkAvailability = async (agencyId, requestedDate, durationMinutes) => {
  const reqStart = new Date(requestedDate);
  const reqEnd = new Date(reqStart.getTime() + durationMinutes * 60000);
  const dayOfWeek = reqStart.getDay(); // 0 = Dimanche, 1 = Lundi...

  // --- FILTRE 1 : Horaires de travail ---
  const schedules = await Schedule.find({
    agency: agencyId,
    dayOfWeek: dayOfWeek,
    isWorking: true
  });
  
  if (schedules.length === 0) return false; // L'agence est fermée ou aucun employé ne bosse

  // --- FILTRE 2 : Absences ---
  // On cherche les congés approuvés qui chevauchent la date demandée
  const absences = await Absence.find({
    agency: agencyId,
    status: 'Approved',
    startDate: { $lte: reqEnd },
    endDate: { $gte: reqStart }
  });

  // On retire les employés absents de notre liste d'employés disponibles
  const absentEmployeeIds = absences.map(a => a.employee.toString());
  const availableEmployees = schedules.filter(s => !absentEmployeeIds.includes(s.employee.toString()));

  const totalCapacity = availableEmployees.length;
  if (totalCapacity === 0) return false; // Tous les employés prévus sont en congé !

  // --- FILTRE 3 : Réservations existantes (Les conflits) ---
  // On récupère toutes les réservations de la journée (ni annulées, ni terminées)
  const startOfDay = new Date(reqStart); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(reqStart); endOfDay.setHours(23,59,59,999);

  const dailyBookings = await Booking.find({
    agency: agencyId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Pending', 'Confirmed', 'InProgress'] } 
  });

  let overlappingBookingsCount = 0;

  for (const booking of dailyBookings) {
    const bookStart = new Date(booking.date);
    const bookEnd = new Date(bookStart.getTime() + booking.totalDurationMinutes * 60000);

    // Formule mathématique pour vérifier si deux périodes se chevauchent :
    // (DebutA < FinB) ET (FinA > DebutB)
    if (reqStart < bookEnd && reqEnd > bookStart) {
      overlappingBookingsCount++;
    }
  }

  // LE VERDICT : Y a-t-il moins de réservations simultanées que d'employés dispos ?
  return overlappingBookingsCount < totalCapacity;
};

// Récupérer les créneaux disponibles pour une journée donnée
exports.getAvailableSlots = async (agencyId, dateString, durationMinutes) => {

  if (!agencyId || !dateString || isNaN(durationMinutes)) {
    throw new AppError("Les paramètres agencyId, date, et duration sont requis et valides.", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(agencyId)) {
    throw new AppError("Format d'ID d'agence invalide.", 400); // Fini les crashs Mongoose 500 !
  }

  const targetDate = new Date(dateString);
  const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 1 = Lundi...

  // 1. Récupérer les horaires d'ouverture de l'agence
  const Agency = require('../models/Agency'); // On l'importe ici ou en haut du fichier
  const agency = await Agency.findById(agencyId);
  if (!agency) throw new AppError("Agence introuvable.", 404);

  // On cherche les horaires pour ce jour de la semaine
  const dayHours = agency.openingHours.find(h => h.dayOfWeek === dayOfWeek);
  
  // Si l'agence est fermée ce jour-là, on renvoie un tableau vide
  if (!dayHours || !dayHours.isOpen) {
    return []; 
  }

  // 2. Convertir les heures d'ouverture (ex: "08:00") en minutes pour faciliter le calcul
  const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
  
  let currentMinutes = openHour * 60 + openMinute;
  const endMinutes = closeHour * 60 + closeMinute;

  const availableSlots = [];
  const step = 30; // On vérifie les créneaux toutes les 30 minutes

  // 3. Boucle sur toute la journée
  while (currentMinutes + durationMinutes <= endMinutes) {
    // Reconvertir les minutes en format HH:MM
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const m = (currentMinutes % 60).toString().padStart(2, '0');
    
    // Créer un objet Date précis pour ce créneau
    const slotTime = new Date(targetDate);
    slotTime.setHours(h, m, 0, 0);

    // On s'assure de ne pas proposer des créneaux dans le passé (si le client regarde pour aujourd'hui)
    if (slotTime > new Date()) {
       // ➔ LA MAGIE EST LÀ : On passe la date dans notre "Entonnoir à 3 filtres"
       const isAvailable = await checkAvailability(agencyId, slotTime, durationMinutes);
       if (isAvailable) {
         availableSlots.push(`${h}:${m}`);
       }
    }

    // On avance de 30 minutes
    currentMinutes += step;
  }

  return availableSlots;
};