const Sentry = require('@sentry/node');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // 1. Stratégie de séparation : 404 vs 500
  if (statusCode === 404) {
    // Force l'envoi d'un message d'alerte, impossible pour Sentry de l'ignorer
    Sentry.captureMessage(`[404] Ressource introuvable : ${err.message}`, {
      level: 'warning', // Apparaîtra en jaune sur le dashboard (ou "error" pour rouge)
      tags: {
        status_code: statusCode,
        type: 'Erreur_Metier',
      },
      extra: {
        url: req.originalUrl,
        method: req.method,
      },
    });
  } else {
    // 2. Comportement classique pour les vrais crashs (500)
    Sentry.captureException(err);
  }

  // 3. Réponse au client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur serveur',
  });
};

module.exports = { errorHandler };
