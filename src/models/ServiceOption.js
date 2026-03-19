const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }, // Prix de l'option
  extraDurationMinutes: { type: Number, default: 0 } // Temps à rajouter au créneau
}, { timestamps: true });

module.exports = mongoose.model('ServiceOption', optionSchema);