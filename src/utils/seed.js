const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const User = require('../models/User');
const Agency = require('../models/Agency');
const Service = require('../models/Service');
const Option = require('../models/ServiceOption');
const Booking = require('../models/Booking'); // ➔ IMPORT DU MODÈLE BOOKING

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB pour le seeding...');

    // --- 1. NETTOYAGE ---
    await Booking.deleteMany({}); // ➔ On nettoie les réservations
    await Option.deleteMany({});
    await Service.deleteMany({});
    await Agency.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Base de données nettoyée.');

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

    // --- 6. CLIENTS ---
    const createdCustomers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = new User({
        firstName: `Client${i}`, lastName: 'Test', email: `client${i}@test.fr`,
        password: commonPassword, phone: `070000000${i}`, role: customerRole._id
      });
      createdCustomers.push(await customer.save());
    }
    console.log('✅ 5 Clients créés.');

    // --- 7. PRESTATIONS ---
    const prestationsData = [
      { name: 'Lavage Extérieur Classique', description: 'Nettoyage carrosserie.', price: 15, durationMinutes: 20 },
      { name: 'Lavage Intérieur', description: 'Aspiration complète.', price: 25, durationMinutes: 30 },
      { name: 'Lavage Premium Intégral', description: 'Intérieur + extérieur.', price: 50, durationMinutes: 60 }
    ];
    const createdServices = await Service.insertMany(prestationsData);
    console.log(`✅ ${createdServices.length} Prestations créées !`);

    // --- 8. OPTIONS ---
    const optionsData = [
      { name: 'Poils d\'animaux', description: 'Aspiration approfondie.', price: 15, durationMinutes: 20 },
      { name: 'Parfum Habitacle', description: 'Senteur au choix.', price: 5, durationMinutes: 0 },
      { name: 'Soin des cuirs', description: 'Baume nourrissant.', price: 25, durationMinutes: 15 }
    ];
    const createdOptions = await Option.insertMany(optionsData);
    console.log(`✅ ${createdOptions.length} Options créées !`);

    // --- 9. RÉSERVATIONS (BOOKINGS) ---
    // On va créer 3 réservations pour le Client 1 dans l'agence de Paris

    const client1 = createdCustomers[0];
    const agenceParis = createdAgencies[0]; // Autoclean Paris
    
    // Dates : Une dans le passé (terminée), deux dans le futur
    const datePast = new Date(); datePast.setDate(datePast.getDate() - 3);
    const dateFuture1 = new Date(); dateFuture1.setDate(dateFuture1.getDate() + 2);
    const dateFuture2 = new Date(); dateFuture2.setDate(dateFuture2.getDate() + 5);

    const bookingsData = [
      { // Réservation 1 : Passée et Complétée (Lavage Extérieur sans option)
        customer: client1._id,
        agency: agenceParis._id,
        service: createdServices[0]._id, // 15€, 20min
        options: [],
        date: datePast,
        totalPrice: 15,
        totalDurationMinutes: 20,
        status: 'Completed'
      },
      { // Réservation 2 : Futur proche, Confirmée (Lavage Intérieur + Parfum)
        customer: client1._id,
        agency: agenceParis._id,
        service: createdServices[1]._id, // 25€, 30min
        options: [createdOptions[1]._id], // Parfum : +5€, +0min
        date: dateFuture1,
        totalPrice: 25 + 5, // = 30€
        totalDurationMinutes: 30 + 0, // = 30min
        status: 'Confirmed'
      },
      { // Réservation 3 : Futur plus lointain, En attente (Premium + Poils + Cuirs)
        customer: client1._id,
        agency: agenceParis._id,
        service: createdServices[2]._id, // 50€, 60min
        options: [createdOptions[0]._id, createdOptions[2]._id], // Poils(+15€,+20m) et Cuirs(+25€,+15m)
        date: dateFuture2,
        totalPrice: 50 + 15 + 25, // = 90€
        totalDurationMinutes: 60 + 20 + 15, // = 95min
        status: 'Pending'
      }
    ];

    await Booking.insertMany(bookingsData);
    console.log(`✅ ${bookingsData.length} Réservations créées pour le CRM !`);

    console.log('🌱 Seeding terminé avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
};

seedDatabase();