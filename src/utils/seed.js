const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const User = require('../models/User');
const Agency = require('../models/Agency');
const Service = require('../models/Service');
const Option = require('../models/ServiceOption')

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB pour le seeding...');

    // --- 1. NETTOYAGE ---
    await Service.deleteMany({}); // ➔ On nettoie aussi le catalogue
    await Agency.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Base de données nettoyée (Prestations, Agences, Users).');

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

    const customerRole = await Role.findOne({ name: 'Customer' });
    const employeeRole = await Role.findOne({ name: 'Employee' });
    const managerRole = await Role.findOne({ name: 'Manager' });
    const superAdminRole = await Role.findOne({ name: 'SuperAdmin' });

    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    // --- 3. SUPER ADMIN ---
    const adminUser = new User({
      firstName: 'Jean', lastName: 'Patron', email: 'admin@autoclean.fr',
      password: commonPassword, phone: '0600000000', role: superAdminRole._id
    });
    await adminUser.save();
    console.log('✅ SuperAdmin créé.');

    // --- 4. AGENCES ---
    const cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'];
    const createdAgencies = [];
    const defaultHours = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i, isOpen: i !== 0, openTime: i !== 0 ? '08:00' : null, closeTime: i !== 0 ? '18:00' : null
    }));

    for (const city of cities) {
      const agency = new Agency({
        name: `Autoclean ${city}`,
        address: { street: '10 rue du Lavage', city: city, zipCode: '00000' },
        phone: '0100000000', openingHours: defaultHours
      });
      createdAgencies.push(await agency.save());
    }
    console.log(`✅ ${createdAgencies.length} Agences créées !`);

    // --- 5. MANAGERS ET EMPLOYÉS ---
    let managerCount = 0;
    let employeeCount = 0;
    
    for (const agency of createdAgencies) {
      const cityName = agency.name.split(' ')[1];
      
      const manager = new User({
        firstName: 'Manager', lastName: cityName, email: `manager.${cityName.toLowerCase()}@autoclean.fr`,
        password: commonPassword, phone: `0622222222`, role: managerRole._id, agency: agency._id
      });
      await manager.save();
      managerCount++;

      for (let i = 1; i <= 5; i++) {
        const employee = new User({
          firstName: `Employé${i}`, lastName: cityName, email: `employe${i}.${cityName.toLowerCase()}@autoclean.fr`,
          password: commonPassword, phone: `061111111${i}`, role: employeeRole._id, agency: agency._id 
        });
        await employee.save();
        employeeCount++;
      }
    }
    console.log(`✅ ${managerCount} Managers et ${employeeCount} Employés créés.`);

    // --- 6. CLIENTS ---
    for (let i = 1; i <= 5; i++) {
      const customer = new User({
        firstName: `Client${i}`, lastName: 'Test', email: `client${i}@test.fr`,
        password: commonPassword, phone: `070000000${i}`, role: customerRole._id
      });
      await customer.save();
    }
    console.log('✅ 5 Clients créés.');

    // --- 7. PRESTATIONS (NOUVEAU) ---
    const prestationsData = [
      { name: 'Lavage Extérieur Classique', description: 'Nettoyage carrosserie, jantes et séchage.', price: 15, durationMinutes: 20 },
      { name: 'Lavage Intérieur', description: 'Aspiration complète, nettoyage des plastiques et vitres.', price: 25, durationMinutes: 30 },
      { name: 'Lavage Premium Intégral', description: 'Formule complète intérieur + extérieur avec finition cire.', price: 50, durationMinutes: 60 },
      { name: 'Rénovation Optiques', description: 'Polissage des phares ternis pour retrouver la transparence.', price: 40, durationMinutes: 45 },
      { name: 'Désinfection Habitacle', description: 'Traitement antibactérien et anti-odeur à l\'ozone.', price: 30, durationMinutes: 20 }
    ];

    for (const prestation of prestationsData) {
      await Service.create(prestation);
    }
    console.log(`✅ ${prestationsData.length} Prestations créées !`);

    // --- 8. OPTIONS ---
    await Option.deleteMany({}); // On nettoie d'abord
    const optionsData = [
      { name: 'Poils d\'animaux', description: 'Aspiration approfondie.', price: 15, durationMinutes: 20 },
      { name: 'Parfum Habitacle', description: 'Senteur au choix.', price: 5, durationMinutes: 0 },
      { name: 'Soin des cuirs', description: 'Baume nourrissant pour sièges.', price: 25, durationMinutes: 15 }
    ];
    // Petite astuce de pro : insertMany permet d'insérer un tableau entier d'un seul coup en base !
    await Option.insertMany(optionsData);
    console.log(`✅ ${optionsData.length} Options créées !`);

    console.log('🌱 Seeding terminé avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
};

seedDatabase();