const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const User = require('../models/User');
const Agency = require('../models/Agency'); // N'oublie pas d'importer le modèle Agency !

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB pour le seeding...');

    // --- 1. NETTOYAGE (Optionnel mais recommandé pour un seed) ---
    // On vide les agences et les utilisateurs (sauf si tu veux les garder, mais c'est mieux pour repartir de zéro)
    await Agency.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Base de données nettoyée (Agences et Users).');

    // --- 2. RÔLES ---
    const rolesData = [
      { name: 'Customer', description: 'Client', permissions: ['book_wash'] },
      { name: 'Employee', description: 'Laveur', permissions: ['view_schedule'] },
      { name: 'Manager', description: 'Gérant', permissions: ['manage_agency'] },
      { name: 'SuperAdmin', description: 'Directeur', permissions: ['manage_all'] }
    ];

    for (const roleData of rolesData) {
      await Role.updateOne({ name: roleData.name }, { $set: roleData }, { upsert: true });
    }
    console.log('✅ Rôles initialisés !');

    // Récupération des IDs des rôles pour la suite
    const customerRole = await Role.findOne({ name: 'Customer' });
    const employeeRole = await Role.findOne({ name: 'Employee' });
    const superAdminRole = await Role.findOne({ name: 'SuperAdmin' });

    // Hachage du mot de passe commun ('password123') une seule fois pour aller plus vite
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    // --- 3. SUPER ADMIN ---
    const adminUser = new User({
      firstName: 'Jean',
      lastName: 'Patron',
      email: 'admin@autoclean.fr',
      password: commonPassword,
      phone: '0600000000',
      role: superAdminRole._id
    });
    await adminUser.save();
    console.log('✅ SuperAdmin créé (admin@autoclean.fr / password123).');

    // --- 4. AGENCES ---
    const cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'];
    const createdAgencies = [];

    // Horaires standards : Lundi au Samedi (1 à 6), 08h-18h. Dimanche (0) fermé.
    const defaultHours = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isOpen: i !== 0, 
      openTime: i !== 0 ? '08:00' : null,
      closeTime: i !== 0 ? '18:00' : null
    }));

    for (const city of cities) {
      const agency = new Agency({
        name: `Autoclean ${city}`,
        address: { street: '10 rue du Lavage', city: city, zipCode: '00000' },
        phone: '0100000000',
        openingHours: defaultHours
      });
      const savedAgency = await agency.save();
      createdAgencies.push(savedAgency);
    }
    console.log(`✅ ${createdAgencies.length} Agences créées !`);

    // --- 5. EMPLOYÉS (5 par agence) ---
    let employeeCount = 0;
    for (const agency of createdAgencies) {
      for (let i = 1; i <= 5; i++) {
        const employee = new User({
          firstName: `Employé${i}`,
          lastName: agency.name.split(' ')[1], // ex: Paris
          email: `employe${i}.${agency.name.split(' ')[1].toLowerCase()}@autoclean.fr`,
          password: commonPassword,
          phone: `061111111${i}`,
          role: employeeRole._id,
          agency: agency._id // On relie l'employé à son agence !
        });
        await employee.save();
        employeeCount++;
      }
    }
    console.log(`✅ ${employeeCount} Employés créés (ex: employe1.paris@autoclean.fr / password123).`);

    // --- 6. CLIENTS (5 faux clients) ---
    for (let i = 1; i <= 5; i++) {
      const customer = new User({
        firstName: `Client${i}`,
        lastName: 'Test',
        email: `client${i}@test.fr`,
        password: commonPassword,
        phone: `070000000${i}`,
        role: customerRole._id
      });
      await customer.save();
    }
    console.log('✅ 5 Clients créés (ex: client1@test.fr / password123).');

    console.log('🌱 Seeding terminé avec succès ! Tu es prêt pour les tests.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
};

seedDatabase();