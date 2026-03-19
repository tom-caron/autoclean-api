const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  
  // ---> Le changement est ici <---
  role: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role', 
    required: true 
  },
  
  // L'employé ou manager est toujours rattaché à UNE agence (optionnel pour les clients et superadmins)
  agency: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);