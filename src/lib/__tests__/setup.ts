/**
 * Global test setup for database mocking
 */

// Mock environment variables needed for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017';
process.env.MONGODB_DB_NAME = 'test-db';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({
    connections: [{ readyState: 1 }],
  }),
  connection: {
    close: jest.fn().mockResolvedValue(true),
    on: jest.fn(),
    readyState: 1,
  },
  connections: [{ readyState: 1 }],
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    methods: {},
    statics: {},
    virtual: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  })),
  model: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(0),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
    exec: jest.fn().mockResolvedValue([]),
  }),
}));

// Mock MongoDB Memory Server
jest.mock('mongodb-memory-server', () => ({
  MongoMemoryServer: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    getUri: jest.fn().mockReturnValue('mongodb://localhost:27017'),
  })),
}));

// Make sure we have a consistent Date.now() implementation for tests
const originalDateNow = Date.now;
global.Date.now = jest.fn(() => 1617981812000); // April 9, 2021

// Restore Date.now after tests
afterAll(() => {
  global.Date.now = originalDateNow;
});