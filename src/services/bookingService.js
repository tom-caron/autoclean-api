const Booking = require('../models/Booking');
const ServiceModel = require('../models/Service');
const Option = require('../models/ServiceOption');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Récupérer toutes les réservations (avec filtre optionnel)
exports.getAllBookings = async (currentUser) => {
  let filter = {};
  
  // ➔ RÈGLE MÉTIER : Cloisonnement pour le Manager
  if (currentUser && currentUser.role === 'Manager') {
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

  // 2. Si le client a choisi des options, on les récupère et on additionne
  if (optionIds && optionIds.length > 0) {
    // $in permet de trouver toutes les options dont l'ID est dans le tableau
    const options = await Option.find({ _id: { $in: optionIds } });
    
    // On s'assure que le client n'a pas envoyé de faux IDs d'options
    if (options.length !== optionIds.length) {
      throw new AppError("Une ou plusieurs options sont invalides.", 400);
    }

    // On ajoute les prix et les durées
    options.forEach(opt => {
      totalPrice += opt.price;
      totalDuration += opt.durationMinutes;
    });
  }

  // 3. Création de la réservation avec les montants sécurisés
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

  // 2. ➔ RÈGLE MÉTIER : Vérification des droits de modification
  if (currentUser) {
    if (currentUser.role === 'Customer') {
      if (booking.customer._id.toString() !== currentUser.userId) {
        throw new AppError("Vous ne pouvez modifier que vos propres réservations.", 403);
      }
    } else if (['Manager', 'Employee'].includes(currentUser.role)) {
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