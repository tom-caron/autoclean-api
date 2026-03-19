const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Dimanche, 1 = Lundi...
  startTime: { type: String, required: true }, // ex: "09:00"
  endTime: { type: String, required: true },   // ex: "17:00"
  // On pourrait même ajouter des pauses :
  breakStartTime: { type: String }, // ex: "12:00"
  breakEndTime: { type: String }    // ex: "13:00"
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);