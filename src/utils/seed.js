const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const User = require('../models/User');
const Agency = require('../models/Agency');
const Service = require('../models/Service');
const Option = require('../models/ServiceOption');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule'); // ➔ NOUVEAU
const Absence = require('../models/Absence');   // ➔ NOUVEAU

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB pour le seeding...');

    // --- 1. NETTOYAGE ---
    await Absence.deleteMany({});  // ➔ NOUVEAU
    await Schedule.deleteMany({}); // ➔ NOUVEAU
    await Booking.deleteMany({});
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
    const createdEmployees = []; // On garde une trace des employés pour les plannings
    
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
        const savedEmployee = await employee.save();
        createdEmployees.push(savedEmployee);
        employeeCount++;
      }
    }
    console.log(`✅ ${managerCount} Managers et ${employeeCount} Employés créés.`);

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
    const client1 = createdCustomers[0];
    const agenceParis = createdAgencies[0];
    
    const datePast = new Date(); datePast.setDate(datePast.getDate() - 3);
    const dateFuture1 = new Date(); dateFuture1.setDate(dateFuture1.getDate() + 2);
    const dateFuture2 = new Date(); dateFuture2.setDate(dateFuture2.getDate() + 5);

    const bookingsData = [
      {
        customer: client1._id, agency: agenceParis._id, service: createdServices[0]._id, options: [],
        date: datePast, totalPrice: 15, totalDurationMinutes: 20, status: 'Completed'
      },
      {
        customer: client1._id, agency: agenceParis._id, service: createdServices[1]._id, options: [createdOptions[1]._id],
        date: dateFuture1, totalPrice: 30, totalDurationMinutes: 30, status: 'Confirmed'
      },
      {
        customer: client1._id, agency: agenceParis._id, service: createdServices[2]._id, options: [createdOptions[0]._id, createdOptions[2]._id],
        date: dateFuture2, totalPrice: 90, totalDurationMinutes: 95, status: 'Pending'
      }
    ];
    await Booking.insertMany(bookingsData);
    console.log(`✅ ${bookingsData.length} Réservations créées pour le CRM !`);

    // --- 10. EMPLOIS DU TEMPS (SCHEDULES) ---
    // On assigne à chaque employé un emploi du temps du Lundi (1) au Vendredi (5) de 09h00 à 17h00.
    const schedulesData = [];
    for (const emp of createdEmployees) {
      for (let day = 1; day <= 5; day++) {
        schedulesData.push({
          employee: emp._id,
          agency: emp.agency,
          dayOfWeek: day,
          isWorking: true,
          startTime: '09:00',
          endTime: '17:00'
        });
      }
    }
    await Schedule.insertMany(schedulesData);
    console.log(`✅ ${schedulesData.length} Créneaux d'emplois du temps créés !`);

    // --- 11. CONGÉS (ABSENCES) ---
    // On va mettre l'Employé 1 de Paris en vacances dans 10 jours, et l'Employé 2 de Paris malade demain.
    const emp1Paris = createdEmployees[0];
    const emp2Paris = createdEmployees[1];

    const vacStart = new Date(); vacStart.setDate(vacStart.getDate() + 10);
    const vacEnd = new Date(); vacEnd.setDate(vacEnd.getDate() + 15);
    
    const sickStart = new Date(); sickStart.setDate(sickStart.getDate() + 1);
    const sickEnd = new Date(); sickEnd.setDate(sickEnd.getDate() + 2);

    const absencesData = [
      {
        employee: emp1Paris._id, agency: emp1Paris.agency,
        startDate: vacStart, endDate: vacEnd,
        reason: 'Vacation', status: 'Approved' // Déjà validé par le Manager
      },
      {
        employee: emp2Paris._id, agency: emp2Paris.agency,
        startDate: sickStart, endDate: sickEnd,
        reason: 'Sick', status: 'Pending' // En attente de validation
      }
    ];
    await Absence.insertMany(absencesData);
    console.log(`✅ ${absencesData.length} Demandes d'absence générées !`);

    console.log('🌱 Seeding terminé avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
};

seedDatabase();