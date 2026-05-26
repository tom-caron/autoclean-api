const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },

    // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },

    isWorking: { type: Boolean, default: true },

    // Format attendu : "09:00", "17:30"
    startTime: { type: String },
    endTime: { type: String },
  },
  { timestamps: true }
);

// Un employé ne peut avoir qu'un seul emploi du temps par jour de la semaine
scheduleSchema.index({ employee: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
