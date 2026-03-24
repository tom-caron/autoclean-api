const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Les relations (Qui, Où, Quoi)
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  
  // Un tableau d'options (car le client peut en choisir plusieurs)
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }],
  
  // Les données du rendez-vous
  date: { type: Date, required: true },
  
  // Les totaux (calculés par le backend)
  totalPrice: { type: Number, required: true },
  totalDurationMinutes: { type: Number, required: true },
  
  // Le cycle de vie de la réservation
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);