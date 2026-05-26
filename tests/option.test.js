const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

describe('Tests des Options Supplémentaires', () => {
  let adminToken;
  let customerToken;

  beforeEach(async () => {
    // 1. Création des rôles
    const adminRole = await Role.create({ name: 'SuperAdmin' });
    const customerRole = await Role.create({ name: 'Customer' });

    // 2. Création de l'Admin et de son token
    const adminUser = await User.create({
      firstName: 'Boss',
      lastName: 'Auto',
      email: 'boss@test.com',
      password: 'hash',
      phone: '0600000000',
      role: adminRole._id,
    });
    adminToken = jwt.sign({ userId: adminUser._id, role: 'SuperAdmin' }, process.env.JWT_SECRET);

    // 3. Création d'un Client et de son token
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
  });

  describe('GET /api/options', () => {
    it('devrait retourner une liste vide au début (accès public)', async () => {
      const res = await request(app).get('/api/options');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
    });
  });

  describe('POST /api/options', () => {
    it('devrait permettre à un SuperAdmin de créer une option (durée 0 min acceptée)', async () => {
      const res = await request(app)
        .post('/api/options')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Parfum Sapin',
          price: 5,
          durationMinutes: 0, // On teste bien que 0 est accepté !
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Parfum Sapin');
      expect(res.body.data.durationMinutes).toBe(0);
    });

    it('devrait bloquer la création pour un Client normal (Test RBAC)', async () => {
      const res = await request(app)
        .post('/api/options')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Cire', price: 10, durationMinutes: 10 });

      // 403 Forbidden : Accès refusé par le restrictTo
      expect(res.statusCode).toBe(403);
    });

    it('devrait bloquer la création si la durée est négative (Test Joi)', async () => {
      const res = await request(app)
        .post('/api/options')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Erreur', price: 10, durationMinutes: -5 }); // Durée invalide

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('durée ne peut pas être négative');
    });
  });
});
