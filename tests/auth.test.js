// tests/auth.test.js
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

describe('Tests d\'Authentification', () => {
  
  // Avant TOUS les tests de ce bloc, on crée le rôle Customer (nécessaire pour register ET login)
  beforeEach(async () => {
    await Role.create({ name: 'Customer', permissions: ['book_wash'] });
  });

  // ==========================================
  // TESTS DE L'INSCRIPTION (REGISTER)
  // ==========================================
  describe('POST /api/auth/register', () => {
    
    it('devrait inscrire un nouvel utilisateur avec des données valides', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'password123',
          phone: '0612345678'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Inscription réussie !');
    });

    it('devrait refuser l\'inscription si l\'email est mal formaté (Test Joi)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'mauvais-email',
          password: 'password123',
          phone: '0612345678'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('format de l\'email est invalide');
    });
  });

  // ==========================================
  // TESTS DE LA CONNEXION (LOGIN)
  // ==========================================
  describe('POST /api/auth/login', () => {
    
    // Avant de tester le login, on crée un faux utilisateur en base de données
    beforeEach(async () => {
      const role = await Role.findOne({ name: 'Customer' });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('monSuperMotDePasse', salt);
      
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: hashedPassword,
        phone: '0600000000',
        role: role._id
      });
    });

    it('devrait connecter l\'utilisateur et renvoyer un token JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@test.com',
          password: 'monSuperMotDePasse' // Le bon mot de passe !
        });

      // On s'attend à un succès 200
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // On vérifie que le token est bien présent dans la réponse
      expect(res.body).toHaveProperty('token');
      // On vérifie que les infos renvoyées sont les bonnes
      expect(res.body.user.email).toBe('jane@test.com');
      // On s'assure que le mot de passe n'est PAS renvoyé au front-end !
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('devrait refuser la connexion avec un mauvais mot de passe', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@test.com',
          password: 'motDePasseFaux' // ❌ Mauvais mot de passe
        });

      // On s'attend à l'erreur 401 qu'on a codée dans authService.js
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Mot de passe incorrect.');
    });

    it('devrait bloquer la requête si un champ est vide (Test Joi)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@test.com',
          password: ""
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Le mot de passe ne doit pas être vide');
    });

    it('devrait bloquer la requête si un champ manque (Test Joi)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@test.com'
          // ❌ Mot de passe oublié !
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Le mot de passe est obligatoire');
    });
  });

});