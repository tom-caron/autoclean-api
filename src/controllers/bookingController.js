const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res, next) => {
  try {
    const newBooking = await bookingService.createBooking(req.user.userId, req.body);
    res.status(201).json({ success: true, message: "Réservation confirmée !", data: newBooking });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user.userId);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    // ➔ On passe simplement l'utilisateur au service
    const bookings = await bookingService.getAllBookings(req.user);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    // ➔ On passe l'utilisateur pour la vérification des droits
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    // ➔ On passe l'utilisateur pour la vérification des droits
    const updatedBooking = await bookingService.updateBooking(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, message: "Réservation mise à jour avec succès.", data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    await bookingService.deleteBooking(req.params.id);
    res.status(200).json({ success: true, message: "Réservation supprimée définitivement." });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { agencyId, date, duration } = req.query;
    
    // Le contrôleur est aveugle : il se contente de passer les paramètres au Service
    const slots = await bookingService.getAvailableSlots(agencyId, date, parseInt(duration));
    
    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};