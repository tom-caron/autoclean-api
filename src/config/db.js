const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // On se connecte à MongoDB en utilisant la variable d'environnement
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    // On arrête le processus si la base de données plante
    process.exit(1);
  }
};

module.exports = connectDB;