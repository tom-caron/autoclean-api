const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex: "Autoclean Paris 15", "Autoclean Lyon"
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  // Horaires d'ouverture par jour (0 = Dimanche, 6 = Samedi)
  openingHours: [{
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String }, // ex: "08:00"
    closeTime: { type: String } // ex: "18:00"
  }]
}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);