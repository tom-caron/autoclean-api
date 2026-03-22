// Importation des dépendances
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
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

app.use('/api/auth', authRoutes);

app.use(errorHandler);

// Définition du port
const PORT = process.env.PORT || 5000;

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});