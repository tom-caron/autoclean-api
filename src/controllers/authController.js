const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    // On passe le corps de la requête au service
    await authService.registerUser(req.body);
    
    // Si aucune erreur n'est "throw" par le service, on arrive ici
    res.status(201).json({
      success: true,
      message: "Inscription réussie !"
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Le service nous retourne le token et l'utilisateur
    const { token, user } = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user a été créé par notre authMiddleware.js à partir du token !
    const userId = req.user.userId; 
    
    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};