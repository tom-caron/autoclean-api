// tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Avant tous les tests : on crée la fausse base de données et on s'y connecte
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Si on est déjà connecté (ex: par le server.js normal), on se déconnecte d'abord
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

// Après CHAQUE test : on vide les collections pour avoir un environnement propre
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Après TOUS les tests : on ferme la connexion et on détruit la fausse base
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
