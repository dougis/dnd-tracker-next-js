/**
 * @jest-environment node
 */

import {
  checkDatabaseHealth,
  ensureDatabaseConnection,
  validateDatabaseConfig,
  connectWithRetry,
} from '../db-utils';

// Mock the db module
jest.mock('../db', () => ({
  connectToDatabase: jest.fn(),
  getConnectionStatus: jest.fn(),
  disconnectFromDatabase: jest.fn(),
}));

const originalEnv = process.env;

describe('Database Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      MONGODB_URI: 'mongodb://localhost:27017',
      MONGODB_DB_NAME: 'test-db',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateDatabaseConfig', () => {
    it('should return valid when all required vars are present', () => {
      const result = validateDatabaseConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.missingVars).toEqual([]);
    });

    it('should return invalid when MONGODB_URI is missing', () => {
      delete process.env.MONGODB_URI;
      
      const result = validateDatabaseConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.missingVars).toContain('MONGODB_URI');
    });

    it('should return invalid when MONGODB_DB_NAME is missing', () => {
      delete process.env.MONGODB_DB_NAME;
      
      const result = validateDatabaseConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.missingVars).toContain('MONGODB_DB_NAME');
    });

    it('should return all missing vars when both are missing', () => {
      delete process.env.MONGODB_URI;
      delete process.env.MONGODB_DB_NAME;
      
      const result = validateDatabaseConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.missingVars).toEqual(['MONGODB_URI', 'MONGODB_DB_NAME']);
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return healthy status when already connected', async () => {
      const { getConnectionStatus } = require('../db');
      getConnectionStatus.mockReturnValue(true);

      const result = await checkDatabaseHealth();

      expect(result.status).toBe('healthy');
      expect(result.connected).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
    });

    it('should connect and return healthy when not already connected', async () => {
      const { getConnectionStatus, connectToDatabase } = require('../db');
      getConnectionStatus.mockReturnValue(false);
      connectToDatabase.mockResolvedValue(undefined);

      const result = await checkDatabaseHealth();

      expect(connectToDatabase).toHaveBeenCalled();
      expect(result.status).toBe('healthy');
      expect(result.connected).toBe(true);
    });

    it('should return unhealthy status on connection error', async () => {
      const { getConnectionStatus, connectToDatabase } = require('../db');
      getConnectionStatus.mockReturnValue(false);
      connectToDatabase.mockRejectedValue(new Error('Connection failed'));

      const result = await checkDatabaseHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('ensureDatabaseConnection', () => {
    it('should connect when not already connected', async () => {
      const { getConnectionStatus, connectToDatabase } = require('../db');
      getConnectionStatus.mockReturnValue(false);
      connectToDatabase.mockResolvedValue(undefined);

      await ensureDatabaseConnection();

      expect(connectToDatabase).toHaveBeenCalled();
    });

    it('should not connect when already connected', async () => {
      const { getConnectionStatus, connectToDatabase } = require('../db');
      getConnectionStatus.mockReturnValue(true);

      await ensureDatabaseConnection();

      expect(connectToDatabase).not.toHaveBeenCalled();
    });
  });

  describe('connectWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const { connectToDatabase } = require('../db');
      connectToDatabase.mockResolvedValue(undefined);

      await expect(connectWithRetry(3, 100)).resolves.toBeUndefined();
      expect(connectToDatabase).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const { connectToDatabase } = require('../db');
      connectToDatabase
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue(undefined);

      await expect(connectWithRetry(3, 10)).resolves.toBeUndefined();
      expect(connectToDatabase).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const { connectToDatabase } = require('../db');
      connectToDatabase.mockRejectedValue(new Error('Always fails'));

      await expect(connectWithRetry(2, 10)).rejects.toThrow(
        'Failed to connect to database after 2 attempts'
      );
      expect(connectToDatabase).toHaveBeenCalledTimes(2);
    });
  });
});