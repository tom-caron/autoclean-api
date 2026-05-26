const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const Role = require('../src/models/Role');
const User = require('../src/models/User');
const Agency = require('../src/models/Agency');
const Service = require('../src/models/Service');
const Option = require('../src/models/ServiceOption');
const Booking = require('../src/models/Booking');

describe('Tests des Réservations (Bookings) et de la Sécurité', () => {
  let adminToken, customerToken, managerParisToken;
  let agencyParis, agencyLyon;
  let testService, testOption;
  let bookingParis, bookingLyon;

  beforeEach(async () => {
    // 1. Rôles
    const adminRole = await Role.create({ name: 'SuperAdmin' });
    const customerRole = await Role.create({ name: 'Customer' });
    const managerRole = await Role.create({ name: 'Manager' });

    // 2. Agences (On en crée 2 pour tester le cloisonnement !)
    agencyParis = await Agency.create({
      name: 'Autoclean Paris',
      address: { street: '1 rue', city: 'Paris', zipCode: '75000' },
      phone: '0100000000',
    });
    agencyLyon = await Agency.create({
      name: 'Autoclean Lyon',
      address: { street: '2 rue', city: 'Lyon', zipCode: '69000' },
      phone: '0400000000',
    });

    // 3. Utilisateurs et Tokens
    const adminUser = await User.create({
      firstName: 'Boss',
      lastName: 'Auto',
      email: 'admin@test.com',
      password: 'hash',
      phone: '0600000000',
      role: adminRole._id,
    });
    adminToken = jwt.sign({ userId: adminUser._id, role: 'SuperAdmin' }, process.env.JWT_SECRET);

    const customerUser = await User.create({
      firstName: 'Client',
      lastName: 'Zero',
      email: 'client@test.com',
      password: 'hash',
      phone: '0611111111',
      role: customerRole._id,
    });
    customerToken = jwt.sign(
      { userId: customerUser._id, role: 'Customer' },
      process.env.JWT_SECRET
    );

    const managerParis = await User.create({
      firstName: 'Manager',
      lastName: 'Paris',
      email: 'manager@paris.com',
      password: 'hash',
      phone: '0622222222',
      role: managerRole._id,
      agency: agencyParis._id,
    });
    managerParisToken = jwt.sign(
      { userId: managerParis._id, role: 'Manager' },
      process.env.JWT_SECRET
    );

    // 4. Prestation et Option
    testService = await Service.create({ name: 'Lavage', price: 25, durationMinutes: 30 });
    testOption = await Option.create({ name: 'Parfum', price: 5, durationMinutes: 0 });

    // 5. Création de réservations existantes pour les tests de lecture/modification
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    bookingParis = await Booking.create({
      customer: customerUser._id,
      agency: agencyParis._id,
      service: testService._id,
      date: futureDate,
      totalPrice: 25,
      totalDurationMinutes: 30,
      status: 'Pending',
    });

    bookingLyon = await Booking.create({
      customer: customerUser._id,
      agency: agencyLyon._id,
      service: testService._id,
      date: futureDate,
      totalPrice: 25,
      totalDurationMinutes: 30,
      status: 'Pending',
    });
  });

  // ==========================================
  // TESTS DE CRÉATION ET HISTORIQUE CLIENT
  // ==========================================
  describe('POST /api/bookings et GET /my-bookings', () => {
    // it('devrait calculer le bon prix à la création', async () => {
    //   const futureDate = new Date();
    //   futureDate.setDate(futureDate.getDate() + 2);
    //   const res = await request(app)
    //     .post('/api/bookings')
    //     .set('Authorization', `Bearer ${customerToken}`)
    //     .send({
    //       agencyId: agencyParis._id.toString(),
    //       serviceId: testService._id.toString(),
    //       optionIds: [testOption._id.toString()],
    //       date: futureDate.toISOString(),
    //     });
    //   expect(res.statusCode).toBe(201);
    //   expect(res.body.data.totalPrice).toBe(30); // 25 + 5
    // });

    it('devrait ramener les réservations du client', async () => {
      const res = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2); // Le client a une résa à Paris et une à Lyon
    });
  });

  // ==========================================
  // TESTS DU TABLEAU DE BORD (STAFF)
  // ==========================================
  describe('GET /api/bookings (Toutes les réservations)', () => {
    it('devrait renvoyer toutes les réservations du réseau pour le SuperAdmin', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('devrait filtrer les réservations pour un Manager (Test Cloisonnement)', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${managerParisToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1); // Il ne doit voir QUE celle de Paris !
      expect(res.body.data[0].agency.name).toBe('Autoclean Paris');
    });
  });

  // ==========================================
  // TESTS DE MODIFICATION ET CLOISONNEMENT
  // ==========================================
  describe('GET et PUT /api/bookings/:id (Une seule réservation)', () => {
    it('devrait permettre au Manager de Paris de modifier une réservation de Paris', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingParis._id}`)
        .set('Authorization', `Bearer ${managerParisToken}`)
        .send({
          status: 'Confirmed',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('Confirmed');
    });

    it("devrait BLOQUER le Manager de Paris s'il essaie de voir la réservation de Lyon", async () => {
      const res = await request(app)
        .get(`/api/bookings/${bookingLyon._id}`)
        .set('Authorization', `Bearer ${managerParisToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('appartient pas à votre agence');
    });
  });

  // ==========================================
  // TESTS DE SUPPRESSION
  // ==========================================
  describe('DELETE /api/bookings/:id', () => {
    it('devrait interdire la suppression à un Manager', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${bookingParis._id}`)
        .set('Authorization', `Bearer ${managerParisToken}`);
      expect(res.statusCode).toBe(403); // Bloqué par restrictTo('SuperAdmin')
    });

    it('devrait permettre la suppression par le SuperAdmin', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${bookingParis._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Réservation supprimée définitivement.');
    });
  });
});
