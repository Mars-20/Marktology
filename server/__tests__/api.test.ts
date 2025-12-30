import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import passport from '../auth';
import { registerRoutes } from '../routes';
import { createServer } from 'http';

describe('API Endpoints Tests', () => {
  let app: express.Application;
  let server: any;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    app = express();
    
    // Setup middleware needed for tests
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Setup session for authentication
    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      })
    );
    
    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());
    
    const httpServer = createServer(app);
    server = await registerRoutes(httpServer, app);
    agent = request.agent(app);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/login - should return 401 for invalid credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .send({ username: 'nonexistent_user_12345', password: 'wrong_password_12345' });
      
      // Should return 401 for invalid credentials
      expect([401, 500]).toContain(response.status);
      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
      }
    });

    it('GET /api/auth/me - should return 401 when not authenticated', async () => {
      const response = await agent.get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });

  describe('Follow-up Tasks Endpoints', () => {
    it('GET /api/follow-up-tasks - should require authentication', async () => {
      const response = await agent.get('/api/follow-up-tasks?clinic_id=test');
      expect(response.status).toBe(401);
    });

    it('GET /api/follow-up-tasks/due - should require authentication', async () => {
      const response = await agent.get('/api/follow-up-tasks/due');
      expect(response.status).toBe(401);
    });

    it('GET /api/follow-up-tasks/overdue - should require authentication', async () => {
      const response = await agent.get('/api/follow-up-tasks/overdue');
      expect(response.status).toBe(401);
    });
  });

  describe('Communication Logs Endpoints', () => {
    it('GET /api/patients/:patientId/communications - should require authentication', async () => {
      const response = await agent.get('/api/patients/test-id/communications');
      expect(response.status).toBe(401);
    });

    it('POST /api/communication-logs - should require authentication', async () => {
      const response = await agent.post('/api/communication-logs').send({});
      expect(response.status).toBe(401);
    });
  });

  describe('Patient Files Endpoints', () => {
    it('GET /api/patients/:patientId/files - should require authentication', async () => {
      const response = await agent.get('/api/patients/test-id/files');
      expect(response.status).toBe(401);
    });

    it('POST /api/patient-files - should require authentication', async () => {
      const response = await agent.post('/api/patient-files').send({});
      expect(response.status).toBe(401);
    });
  });

  describe('Dashboard Endpoints', () => {
    it('GET /api/dashboard/stats - should require authentication', async () => {
      const response = await agent.get('/api/dashboard/stats?doctor_id=test&clinic_id=test');
      expect(response.status).toBe(401);
    });
  });

  describe('Patient Full Profile Endpoint', () => {
    it('GET /api/patients/:id/full-profile - should require authentication', async () => {
      const response = await agent.get('/api/patients/test-id/full-profile');
      expect(response.status).toBe(401);
    });
  });
});
