/**
 * @jest-environment node
 */

// Import functions dynamically in tests to avoid unused import warnings
// import { connectToDatabase, disconnectFromDatabase, getConnectionStatus } from '../db';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    close: jest.fn(),
    on: jest.fn(),
    readyState: 1,
  },
  connections: [{ readyState: 1 }],
}));

// Import MongoDB setup utilities to ensure proper test environment
jest.mock('./mongodb-setup', () => ({
  setupTestMongoDB: jest.fn().mockResolvedValue({
    uri: 'mongodb://localhost:27017',
    dbName: 'test-db'
  }),
  validateMongoDBEnvironment: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Reset module cache to ensure fresh state
    
    // Setup for both CI and local environments
    process.env = {
      ...originalEnv,
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'test-db',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('connectToDatabase', () => {
    it('should connect to MongoDB successfully', async () => {
      const mongoose = require('mongoose');

      // Setup mongoose mock properly
      mongoose.connections = [{ readyState: 1 }];
      mongoose.connect.mockResolvedValue({
        connections: [{ readyState: 1 }],
      });

      const { connectToDatabase } = require('../db');
      await connectToDatabase();

      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017',
        expect.objectContaining({
          dbName: 'test-db',
          bufferCommands: false,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          family: 4,
        })
      );
    });

    it('should throw error when MONGODB_URI is not defined', async () => {
      delete process.env.MONGODB_URI;
      const { connectToDatabase } = require('../db');

      await expect(connectToDatabase()).rejects.toThrow(
        'MONGODB_URI environment variable is not defined'
      );
    });

    it('should throw error when MONGODB_DB_NAME is not defined', async () => {
      delete process.env.MONGODB_DB_NAME;
      const { connectToDatabase } = require('../db');

      await expect(connectToDatabase()).rejects.toThrow(
        'MONGODB_DB_NAME environment variable is not defined'
      );
    });

    it('should handle connection errors', async () => {
      const mongoose = require('mongoose');
      const connectionError = new Error('Connection failed');
      mongoose.connect.mockRejectedValue(connectionError);
      const { connectToDatabase } = require('../db');

      await expect(connectToDatabase()).rejects.toThrow('Connection failed');
    });

    it('should not reconnect if already connected', async () => {
      const mongoose = require('mongoose');

      // Setup mongoose mock properly
      mongoose.connections = [{ readyState: 1 }];
      mongoose.connect.mockResolvedValue({
        connections: [{ readyState: 1 }],
      });

      const { connectToDatabase } = require('../db');
      await connectToDatabase();

      // Reset mock calls
      mongoose.connect.mockClear();

      // Second call should not trigger connect
      await connectToDatabase();

      expect(mongoose.connect).not.toHaveBeenCalled();
    });
  });

  describe('disconnectFromDatabase', () => {
    it('should disconnect from MongoDB', async () => {
      const mongoose = require('mongoose');

      // Setup mongoose mock properly
      mongoose.connections = [{ readyState: 1 }];
      mongoose.connect.mockResolvedValue({
        connections: [{ readyState: 1 }],
      });

      const { connectToDatabase, disconnectFromDatabase } = require('../db');

      // Simulate connected state
      await connectToDatabase();

      await disconnectFromDatabase();

      expect(mongoose.connection.close).toHaveBeenCalled();
    });

    it('should handle disconnection when not connected', async () => {
      const mongoose = require('mongoose');

      const { disconnectFromDatabase } = require('../db');
      await disconnectFromDatabase();

      expect(mongoose.connection.close).not.toHaveBeenCalled();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return false when not connected', () => {
      const { getConnectionStatus } = require('../db');
      expect(getConnectionStatus()).toBe(false);
    });

    it('should return true when connected', async () => {
      const mongoose = require('mongoose');

      // Setup mongoose mock properly
      mongoose.connections = [{ readyState: 1 }];
      mongoose.connect.mockResolvedValue({
        connections: [{ readyState: 1 }],
      });

      const { connectToDatabase, getConnectionStatus } = require('../db');
      await connectToDatabase();

      expect(getConnectionStatus()).toBe(true);
    });
  });
});
