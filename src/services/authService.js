const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.registerUser = async (userData) => {
  const { firstName, lastName, email, password, phone } = userData;

  // 1. Vérifier si l'utilisateur existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Cet email est déjà utilisé.", 400);
  }

  // 2. Trouver le rôle Customer
  const customerRole = await Role.findOne({ name: 'Customer' });
  if (!customerRole) {
    throw new AppError("Erreur interne : Rôle par défaut introuvable.", 500);
  }

  // 3. Hacher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Sauvegarder en base
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    role: customerRole._id
  });

  await newUser.save();
  return newUser;
};

exports.loginUser = async (email, password) => {
  // 1. Chercher l'utilisateur avec son rôle
  const user = await User.findOne({ email }).populate('role');
  if (!user) {
    throw new AppError("Aucun compte trouvé avec cet email.", 401);
  }

  // 2. Vérifier le mot de passe
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Mot de passe incorrect.", 401);
  }

  // 3. Générer le JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // 4. Retourner le token et l'utilisateur (sans le mot de passe)
  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name
    }
  };
};

exports.getUserProfile = async (userId) => {
  // On récupère l'utilisateur avec son rôle et son agence s'il en a une
  const user = await User.findById(userId).populate('role').populate('agency');
  
  if (!user) {
    throw new AppError("Utilisateur introuvable.", 404);
  }

  // Sécurité : On retire le mot de passe de l'objet avant de le renvoyer au front
  user.password = undefined; 
  
  return user;
};