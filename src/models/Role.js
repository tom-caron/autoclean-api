const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true // ex: "Manager", "Employee", "Customer", "SuperAdmin"
  },
  description: { type: String },
  // Le vrai pouvoir d'un modèle Role séparé : définir des permissions granulaires !
  permissions: [{ 
    type: String 
    // ex: ['create_booking', 'edit_booking', 'delete_booking', 'manage_users', 'view_stats']
  }]
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);