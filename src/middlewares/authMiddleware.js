const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  try {
    // Le token est généralement envoyé dans le header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    const token = authHeader.split(' ')[1];

    // Vérification du token avec notre clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // On attache les infos décodées (userId, role) à la requête pour les utiliser plus tard
    req.user = decoded; 
    
    // On passe à la suite (le contrôleur de la route)
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};