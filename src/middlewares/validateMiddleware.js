const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    // abortEarly: false permet de récupérer TOUTES les erreurs d'un coup, pas juste la première
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // On extrait tous les messages d'erreur et on les assemble
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      // On jette une erreur 400 (Bad Request)
      return next(new AppError(`Erreur de validation : ${errorMessage}`, 400));
    }
    
    next();
  };
};

module.exports = validate;