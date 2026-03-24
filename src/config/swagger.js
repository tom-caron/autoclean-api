const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Autoclean Pro',
      version: '1.0.0',
      description: 'Documentation interactive de l\'API pour le CRM de lavage automobile. Développée pour le projet de fin d\'études.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de Développement',
      },
    ],
    // ➔ On configure le cadenas pour le JWT !
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // ➔ Swagger va chercher les commentaires dans tous les fichiers du dossier routes
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;