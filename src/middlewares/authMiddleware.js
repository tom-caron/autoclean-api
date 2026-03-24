const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError'); // Import de notre classe d'erreur

// 1. Le vigile qui vérifie si on est connecté (celui qu'on a déjà fait)
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError("Accès refusé. Aucun token fourni.", 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Contient { userId: '...', role: 'SuperAdmin', iat, exp }
    next();
  } catch (error) {
    next(new AppError("Token invalide ou expiré.", 401));
  }
};

// 2. Le NOUVEAU vigile qui vérifie les rôles
// APRÈS (La version corrigée)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. On récupère le nom du rôle, peu importe la structure
    const userRoleName = typeof req.user.role === 'object' 
      ? req.user.role.name 
      : req.user.role;

    console.log("Rôle détecté :", userRoleName); // Petit log pour être sûr
    console.log("Rôles autorisés :", roles);

    // 2. On compare le NOM du rôle
    if (!roles.includes(userRoleName)) {
      return next(new AppError("Vous n'avez pas la permission d'effectuer cette action.", 403));
    }
    
    next();
  };
};