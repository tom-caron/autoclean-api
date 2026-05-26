const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    reason: { type: String, enum: ['Vacation', 'Sick', 'Other'], default: 'Other' },

    // Le manager doit valider les congés
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Absence', absenceSchema);
