const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

describe('Tests du Catalogue de Prestations', () => {
  let adminToken;
  let customerToken;

  beforeEach(async () => {
    // 1. Création des rôles
    const adminRole = await Role.create({ name: 'SuperAdmin' });
    const customerRole = await Role.create({ name: 'Customer' });

    // 2. Création de l'Admin et de son token
    const adminUser = await User.create({
      firstName: 'Boss', lastName: 'Auto', email: 'boss@test.com',
      password: 'hash', phone: '0600000000', role: adminRole._id
    });
    adminToken = jwt.sign({ userId: adminUser._id, role: 'SuperAdmin' }, process.env.JWT_SECRET);

    // 3. Création d'un Client et de son token
    const customerUser = await User.create({
      firstName: 'Client', lastName: 'Zero', email: 'client@test.com',
      password: 'hash', phone: '0611111111', role: customerRole._id
    });
    customerToken = jwt.sign({ userId: customerUser._id, role: 'Customer' }, process.env.JWT_SECRET);
  });

  describe('GET /api/prestations', () => {
    it('devrait retourner une liste vide au début (accès public)', async () => {
      const res = await request(app).get('/api/prestations');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('POST /api/prestations', () => {
    it('devrait permettre à un SuperAdmin de créer une prestation', async () => {
      const res = await request(app)
        .post('/api/prestations')
        .set('Authorization', `Bearer ${adminToken}`) // On passe le token dans le header !
        .send({
          name: 'Lavage Premium',
          price: 49.99,
          durationMinutes: 60
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Lavage Premium');
      expect(res.body.data.price).toBe(49.99);
    });

    it('devrait bloquer la création pour un Client normal (Test RBAC)', async () => {
      const res = await request(app)
        .post('/api/prestations')
        .set('Authorization', `Bearer ${customerToken}`) // Token du client !
        .send({ name: 'Lavage', price: 10, durationMinutes: 15 });

      // 403 Forbidden : Accès refusé par le restrictTo
      expect(res.statusCode).toBe(403); 
    });

    it('devrait bloquer la création si le prix est négatif (Test Joi)', async () => {
      const res = await request(app)
        .post('/api/prestations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Lavage', price: -5, durationMinutes: 15 }); // Prix invalide

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('prix ne peut pas être négatif');
    });
  });
});