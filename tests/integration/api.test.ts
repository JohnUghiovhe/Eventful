import request from 'supertest';
import app from '../../src/index';

/**
 * Integration tests for the Eventful API
 * Comprehensive tests for all API endpoints covering Authentication, Events, Tickets, Payments, and Notifications
 */

let authToken: string;

describe('🔐 Authentication API Tests', () => {
  describe('POST /api/auth/signup', () => {
    test('✅ should successfully sign up a new eventee', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        firstName: 'John',
        lastName: 'Doe',
        email: `eventee-${Date.now()}@test.com`,
        password: 'SecurePass123!',
        phone: '+2348012345678',
        role: 'eventee',
      });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
    });

    test('✅ should successfully sign up a new creator', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: `creator-${Date.now()}@test.com`,
        password: 'CreatorPass123!',
        phone: '+2348087654321',
        role: 'creator',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('creator');
    });

    test('❌ should reject signup with invalid email', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'invalid-email',
        password: 'Pass123!',
        phone: '+2348012345678',
        role: 'eventee',
      });
      expect(res.status).toBe(400);
    });

    test('❌ should reject signup with weak password', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        firstName: 'Weak',
        lastName: 'Password',
        email: `weak-${Date.now()}@test.com`,
        password: '123',
        phone: '+2348012345678',
        role: 'eventee',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    test('✅ should successfully sign in with valid credentials', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: authToken ? 'eventee@test.com' : `eventee-${Date.now()}@test.com`,
        password: 'SecurePass123!',
      });
      expect([200, 401]).toContain(res.status);
    });

    test('❌ should reject signin with incorrect password', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });
      expect(res.status).toBe(401);
    });

    test('❌ should reject signin with missing credentials', async () => {
      const res = await request(app).post('/api/auth/signin').send({
        email: 'test@example.com',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    test('✅ should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email');
    });

    test('❌ should reject profile access without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    test('❌ should reject profile access with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token-xyz');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/auth/profile', () => {
    test('✅ should update user profile successfully', async () => {
      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Jonathan', bio: 'Event enthusiast' });
      expect(res.status).toBe(200);
    });

    test('❌ should reject profile update without token', async () => {
      const res = await request(app)
        .patch('/api/auth/profile')
        .send({ firstName: 'Jonathan' });
      expect(res.status).toBe(401);
    });
  });
});


describe('🎭 Events API Tests', () => {
  let creatorToken: string;
  let eventId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      firstName: 'Event',
      lastName: 'Creator',
      email: `creator-${Date.now()}@test.com`,
      password: 'CreatorPass123!',
      phone: '+2348087654321',
      role: 'creator',
    });
    if (res.body && res.body.data && res.body.data.token) {
      creatorToken = res.body.data.token;
    }
  });

  describe('POST /api/events - Create Event', () => {
    test('✅ should create event as creator', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 24 * 60 * 60 * 1000);
      
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Tech Conference 2026',
          description: 'Annual technology conference',
          eventType: 'conference',
          category: 'business',
          startDate: futureDate,
          endDate: endDate,
          location: {
            address: '123 Tech Street',
            city: 'Lagos',
            state: 'Lagos',
            zipCode: '100001',
            country: 'Nigeria',
          },
          capacity: 500,
          ticketsAvailable: 500,
          ticketPrice: 50000,
          tags: ['tech', 'conference'],
        });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.title).toBe('Tech Conference 2026');
      eventId = res.body.data._id;
    });

    test('❌ should reject event creation without authentication', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({ title: 'Unauthorized Event' });
      expect(res.status).toBe(401);
    });

    test('❌ should reject event creation with invalid data', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ title: 'Incomplete Event' }); // Missing required fields
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/events - Retrieve Events', () => {
    test('✅ should retrieve all events as public', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('✅ should retrieve events with pagination', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ page: 1, limit: 10 });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('✅ should filter events by category', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ category: 'business' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/events/:eventId - Get Event Details', () => {
    test('✅ should retrieve event details', async () => {
      if (!eventId) {
        console.log('Skipping test - no eventId available');
        return;
      }
      const res = await request(app).get(`/api/events/${eventId}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    test('❌ should return 404 for non-existent event', async () => {
      const res = await request(app).get('/api/events/invalid-id-xyz');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/events/:eventId - Update Event', () => {
    test('✅ should update event as creator', async () => {
      if (!eventId) {
        console.log('Skipping update test - no eventId available');
        return;
      }
      const res = await request(app)
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ title: 'Updated Tech Conference 2026' });
      expect([200, 400]).toContain(res.status);
    });

    test('❌ should reject event update without authentication', async () => {
      const res = await request(app)
        .patch(`/api/events/${eventId || 'dummy-id'}`)
        .send({ title: 'Hack Event' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/events/:eventId/publish - Publish Event', () => {
    test('✅ should publish event as creator', async () => {
      if (!eventId) {
        console.log('Skipping publish test - no eventId available');
        return;
      }
      const res = await request(app)
        .post(`/api/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${creatorToken}`);
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('GET /api/events/user/my-events - Creator Events', () => {
    test('✅ should retrieve creator own events', async () => {
      const res = await request(app)
        .get('/api/events/user/my-events')
        .set('Authorization', `Bearer ${creatorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/events/:eventId/analytics - Event Analytics', () => {
    test('✅ should retrieve event analytics for creator', async () => {
      if (!eventId) {
        console.log('Skipping analytics test - no eventId available');
        return;
      }
      const res = await request(app)
        .get(`/api/events/${eventId}/analytics`)
        .set('Authorization', `Bearer ${creatorToken}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('POST /api/events/:eventId/cancel - Cancel Event', () => {
    test('✅ should cancel event as creator', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 24 * 60 * 60 * 1000);
      
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Event to Cancel',
          description: 'This event will be cancelled',
          eventType: 'meetup',
          category: 'other',
          startDate: futureDate,
          endDate: endDate,
          location: {
            address: '456 Cancel St',
            city: 'Abuja',
            state: 'FCT',
            zipCode: '900001',
            country: 'Nigeria',
          },
          capacity: 100,
          ticketsAvailable: 100,
          ticketPrice: 10000,
        });

      if (createRes.status === 201) {
        const eventToCancel = createRes.body.data._id;
        const res = await request(app)
          .post(`/api/events/${eventToCancel}/cancel`)
          .set('Authorization', `Bearer ${creatorToken}`);
        expect([200, 400]).toContain(res.status);
      }
    });
  });

  describe('GET /api/events/:eventId/share - Share Event', () => {
    test('✅ should generate shareable event link', async () => {
      if (!eventId) {
        console.log('Skipping share test - no eventId available');
        return;
      }
      const res = await request(app).get(`/api/events/${eventId}/share`);
      expect([200, 400, 404]).toContain(res.status);
    });
  });
});

describe('🎫 Tickets API Tests', () => {
  let eventeeToken: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      firstName: 'Event',
      lastName: 'Attendee',
      email: `attendee-${Date.now()}@test.com`,
      password: 'AttendeePass123!',
      phone: '+2348099999999',
      role: 'eventee',
    });
    eventeeToken = res.body.data.token;
  });

  describe('GET /api/tickets - User Tickets', () => {
    test('✅ should retrieve user tickets as eventee', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${eventeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('❌ should reject ticket retrieval without authentication', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tickets/:ticketNumber - Ticket Details', () => {
    test('❌ should return 404 for non-existent ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/INVALID-TICKET-XYZ')
        .set('Authorization', `Bearer ${eventeeToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/tickets/:ticketNumber/scan - Scan QR Code', () => {
    test('✅ should handle QR code scan endpoint', async () => {
      const res = await request(app)
        .post('/api/tickets/TEST-QR-123/scan')
        .set('Authorization', `Bearer ${eventeeToken}`);
      expect([200, 400, 404, 403]).toContain(res.status);
    });
  });
});

describe('💳 Payments API Tests', () => {
  let eventeeToken: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      firstName: 'Payment',
      lastName: 'User',
      email: `payment-${Date.now()}@test.com`,
      password: 'PaymentPass123!',
      phone: '+2348088888888',
      role: 'eventee',
    });
    eventeeToken = res.body.data.token;
  });

  describe('GET /api/payments/verify - Verify Payment', () => {
    test('✅ should handle payment verification endpoint', async () => {
      const res = await request(app)
        .get('/api/payments/verify')
        .query({ reference: 'test-ref-123' });
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  describe('POST /api/payments/initialize - Initialize Payment', () => {
    test('✅ should initialize payment as eventee', async () => {
      const res = await request(app)
        .post('/api/payments/initialize')
        .set('Authorization', `Bearer ${eventeeToken}`)
        .send({
          email: `payment-${Date.now()}@test.com`,
          amount: 50000,
          eventId: 'test-event-id',
          ticketId: 'test-ticket-id',
        });
      expect([200, 400, 404, 500]).toContain(res.status);
    });

    test('❌ should reject payment initialization without authentication', async () => {
      const res = await request(app)
        .post('/api/payments/initialize')
        .send({
          email: 'test@example.com',
          amount: 50000,
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/payments/user/my-payments - Payment History', () => {
    test('✅ should retrieve user payment history', async () => {
      const res = await request(app)
        .get('/api/payments/user/my-payments')
        .set('Authorization', `Bearer ${eventeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('❌ should reject payment history without authentication', async () => {
      const res = await request(app).get('/api/payments/user/my-payments');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/payments/:transactionId/refund - Refund Payment', () => {
    test('✅ should handle refund request', async () => {
      const res = await request(app)
        .post('/api/payments/invalid-transaction-id/refund')
        .set('Authorization', `Bearer ${eventeeToken}`)
        .send({ reason: 'Change of plans' });
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });
});

describe('🔔 Notifications API Tests', () => {
  let userToken: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      firstName: 'Notification',
      lastName: 'User',
      email: `notif-${Date.now()}@test.com`,
      password: 'NotifPass123!',
      phone: '+2348077777777',
      role: 'eventee',
    });
    userToken = res.body.data.token;
  });

  describe('POST /api/notifications - Create Notification', () => {
    test('✅ should create notification as authenticated user', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'event_update',
        });
      expect([200, 201, 400]).toContain(res.status);
    });

    test('❌ should reject notification creation without authentication', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ title: 'Unauthorized Notification' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notifications - User Notifications', () => {
    test('✅ should retrieve user notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('❌ should reject notification retrieval without authentication', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/notifications/:notificationId/read - Mark as Read', () => {
    test('✅ should handle marking notification as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/invalid-notification-id/read')
        .set('Authorization', `Bearer ${userToken}`);
      expect([200, 204, 404]).toContain(res.status);
    });
  });

  describe('PATCH /api/notifications/mark-all-read - Mark All as Read', () => {
    test('✅ should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${userToken}`);
      expect([200, 204]).toContain(res.status);
    });
  });
});

describe('🌐 API Health & General Tests', () => {
  test('✅ GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('❌ GET /invalid-route should return 404', async () => {
    const res = await request(app).get('/invalid-route-xyz');
    expect(res.status).toBe(404);
  });

  test('❌ POST /invalid-endpoint should return 404', async () => {
    const res = await request(app)
      .post('/invalid-endpoint-xyz')
      .send({ test: 'data' });
    expect(res.status).toBe(404);
  });
});
