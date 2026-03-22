const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  
  // L'employé assigné au lavage (peut être nul au moment de la réservation client)
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOption' }], // Liste des options choisies
  
  date: { type: Date, required: true }, // Date et heure de DÉBUT
  totalDuration: { type: Number, required: true }, // Durée totale calculée (Service + Options) en minutes
  totalPrice: { type: Number, required: true }, // Prix total calculé
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);