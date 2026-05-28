// Importation des dépendances
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const authRoutes = require('./src/routes/authRoutes');
const agencyRoutes = require('./src/routes/agencyRoutes');
const prestationRoutes = require('./src/routes/prestationRoutes');
const optionRoutes = require('./src/routes/optionRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const absenceRoutes = require('./src/routes/absenceRoutes');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://autoclean-client.vercel.app',
  'https://autoclean-crm.vercel.app',
];
// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Autorise Postman, curl ou requêtes serveur sans origin
      if (!origin) return callback(null, true);

      // Autorise les domaines exacts
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Autorise aussi les previews Vercel du même projet
      if (/^https:\/\/autoclean-crm.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS bloqué pour l'origine : ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/prestations', prestationRoutes);
app.use('/api/options', optionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/absences', absenceRoutes);

app.use(errorHandler);

// Définition du port
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;
