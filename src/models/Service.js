const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex: "Lavage Intérieur Premium"
  description: { type: String },
  price: { type: Number, required: true },
  durationMinutes: { type: Number, required: true } // Pour calculer les créneaux dans l'agenda
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);