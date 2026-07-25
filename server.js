require('dotenv').config();
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const express = require('express');
const app = express();
// 1. Initialisation de Sentry (DOIT se faire AVANT l'import d'Express)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const cors = require('cors');
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

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/prestations', prestationRoutes);
app.use('/api/options', optionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/absences', absenceRoutes);

// Route de test Sentry
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('Erreur 500 : Crash critique du serveur (Simulation pour Monitoring)');
});

// NOUVEAU Gestionnaire d'erreurs Sentry (DOIT être placé ICI, avant tes middlewares d'erreur)
Sentry.setupExpressErrorHandler(app);

// Ton middleware d'erreur personnalisé
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
