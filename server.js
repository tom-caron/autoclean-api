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

// Connexion à la base de données
connectDB();

// Initialisation d'Express
const app = express();

// Middlewares
app.use(cors()); // Autorise les requêtes de tes futurs fronts Vue.js
app.use(express.json()); // Permet à ton API de lire les données JSON (formulaires, etc.)

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

// Lancement du serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;
