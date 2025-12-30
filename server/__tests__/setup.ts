import { beforeAll, afterAll, afterEach } from 'vitest';

// Set test environment variables BEFORE any imports
process.env.DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_oMpsuEtT5AC6@ep-green-heart-a-afpsaxq9-pooler.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only-minimum-32-characters-long';
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.APP_NAME = 'Marktology OS Test';
process.env.APP_URL = 'http://localhost:5001';

// Setup runs before all tests
beforeAll(async () => {
  // Initialize test database connection if needed
  console.log('Test suite starting...');
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'missing');
});

// Cleanup runs after all tests
afterAll(async () => {
  // Close database connections
  console.log('Test suite complete.');
});

// Reset state after each test
afterEach(async () => {
  // Clear test data if needed
});

