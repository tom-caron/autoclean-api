// src/middlewares/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // 1. On récupère le statusCode de notre AppError, ou on met 500 par défaut
  let statusCode = err.statusCode || 500;
  
  // Petite sécurité : si par hasard le statut est toujours à 200 (OK) malgré une erreur, on force à 500
  if (statusCode === 200) {
    statusCode = 500;
  }

  // 2. On applique le code d'erreur à la réponse HTTP
  res.status(statusCode);

  // 3. On renvoie notre format JSON standardisé
  res.json({
    success: false,
    message: err.message || "Erreur interne du serveur",
    // On cache la stack trace en production pour des raisons de sécurité
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };