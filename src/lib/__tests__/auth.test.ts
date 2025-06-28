/**
 *Authentication Configuration Tests
 *
 *This test file validates the NextAuth configuration for the D&D Tracker application.
 *It tests the credentials provider configuration, session/JWT callbacks, and error handling.
 */

import { UserService } from '../services/UserService';

// Mock external dependencies
jest.mock('../services/UserService');
jest.mock('@auth/mongodb-adapter');
jest.mock('mongodb');
jest.mock('next-auth');
jest.mock('next-auth/providers/credentials');

// Setup environment variables for testing
const originalEnv = process.env;
beforeAll(() => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  process.env.MONGODB_DB_NAME = 'testdb';
  process.env.NEXTAUTH_SECRET = 'test-secret';
});

afterAll(() => {
  process.env = originalEnv;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Authentication Configuration', () => {
  describe('NextAuth Setup', () => {
    it('should configure NextAuth with required settings', () => {
      // Import the auth module to trigger configuration
      delete require.cache[require.resolve('../auth')];
      require('../auth');

      const NextAuth = require('next-auth');
      expect(NextAuth).toHaveBeenCalled();
      const config = NextAuth.mock.calls[0][0];
      expect(config).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(config.session).toBeDefined();
      expect(config.callbacks).toBeDefined();
      expect(config.pages).toBeDefined();
    });

    it('should configure session strategy as database', () => {
      delete require.cache[require.resolve('../auth')];
      require('../auth');

      const NextAuth = require('next-auth');
      const config = NextAuth.mock.calls[0][0];
      
      expect(config.session.strategy).toBe('database');
      expect(config.session.maxAge).toBe(30 *24 *60 *60); // 30 days
      expect(config.session.updateAge).toBe(24 *60 *60); // 24 hours
    });

    it('should configure custom pages', () => {
      delete require.cache[require.resolve('../auth')];
      require('../auth');

      const NextAuth = require('next-auth');
      const config = NextAuth.mock.calls[0][0];
      
      expect(config.pages.signIn).toBe('/auth/signin');
      expect(config.pages.error).toBe('/auth/error');
    });

    it('should configure debug mode based on environment', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      
      // Test development mode
      process.env.NODE_ENV = 'development';
      delete require.cache[require.resolve('../auth')];
      require('../auth');
      
      const NextAuth = require('next-auth');
      const configDev = NextAuth.mock.calls[NextAuth.mock.calls.length - 1][0];
      expect(configDev.debug).toBe(true);
      
      // Test production mode
      process.env.NODE_ENV = 'production';
      delete require.cache[require.resolve('../auth')];
      require('../auth');
      
      const configProd = NextAuth.mock.calls[NextAuth.mock.calls.length - 1][0];
      expect(configProd.debug).toBe(false);
      
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should have credentials provider configured', () => {
      delete require.cache[require.resolve('../auth')];
      require('../auth');

      const NextAuth = require('next-auth');
      const config = NextAuth.mock.calls[0][0];
      
      expect(config.providers).toHaveLength(1);
      const provider = config.providers[0];
      expect(provider.name).toBe('credentials');
      expect(provider.credentials).toEqual({
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      });
    });
  });

  describe('Credentials Provider Authorization', () => {
    let authorizeFunction: any;

    beforeEach(() => {
      delete require.cache[require.resolve('../auth')];
      require('../auth');
      
      const NextAuth = require('next-auth');
      const config = NextAuth.mock.calls[0][0];
      authorizeFunction = config.providers[0].authorize;
    });

    it('should return null for missing credentials', async () => {
      const testCases = [
        null,
        {},
        { email: 'test@example.com' },
        { password: 'password123' },
      ];

      for (const credentials of testCases) {
        const result = await authorizeFunction(credentials);
        expect(result).toBeNull();
      }
    });

    it('should return null when user lookup fails', async () => {
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'User not found' },
      });

      const result = await authorizeFunction({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
      expect(UserService.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should return null when authentication fails', async () => {
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue({
        success: true,
        data: { email: 'test@example.com' },
      });

      (UserService.authenticateUser as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Invalid credentials' },
      });

      const result = await authorizeFunction({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
      expect(UserService.authenticateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      });
    });

    it('should return null when authentication succeeds but no user data', async () => {
      (UserService.getUserByEmail as jest.Mock).mockResolvedValue({
        success: true,
        data: { email: 'test@example.com' },
      });

      (UserService.authenticateUser as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await authorizeFunction({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
    });

    it('should return user object for successful authentication', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'premium',
      };

      (UserService.getUserByEmail as jest.Mock).mockResolvedValue({
        success: true,
        data: { email: 'test@example.com' },
      });

      (UserService.authenticateUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { user: mockUser },
      });

      const result = await authorizeFunction({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'John Doe',
        subscriptionTier: 'premium',
      });
    });

    it('should handle user without _id', async () => {
      const mockUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
      };

      (UserService.getUserByEmail as jest.Mock).mockResolvedValue({
        success: true,
        data: { email: 'test@example.com' },
      });

      (UserService.authenticateUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { user: mockUser },
      });

      const result = await authorizeFunction({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: '',
        email: 'test@example.com',
        name: 'John Doe',
        subscriptionTier: 'free',
      });
    });

    it('should handle authentication errors gracefully', async () => {
      (UserService.getUserByEmail as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await authorizeFunction({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Authentication error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Session Callback', () => {
    let sessionCallback: any;

    beforeEach(() => {
      delete require.cache[require.resolve('../auth')];
      require('../auth');
      
      const NextAuth = require('next-auth');
      const config = NextAuth.mock.calls[0][0];
      sessionCallback = config.callbacks.session;
    });

    it('should add user ID and subscription tier to session', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'John Doe',
        },
      };

      const mockUser = {
        id: '507f1f77bcf86cd799439011',
        subscriptionTier: 'premium',
      };

      const result = await sessionCallback({
        session: mockSession,
        user: mockUser,
      });

      expect(result.user.id).toBe('507f1f77bcf86cd799439011');
      expect(result.user.subscriptionTier).toBe('premium');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('John Doe');
    });

    it('should default to free subscription tier when not provided', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'John Doe',
        },
      };

      const mockUser = {
        id: '507f1f77bcf86cd799439011',
      };

      const result = await sessionCallback({
        session: mockSession,
        user: mockUser,
      });

      expect(result.user.subscriptionTier).toBe('free');
    });

    it('should handle missing session user gracefully', async () => {
      const mockSession = {};
      const mockUser = {
        id: '507f1f77bcf86cd799439011',
        subscriptionTier: 'premium',
      };

      const result = await sessionCallback({
        session: mockSession,
        user: mockUser,
      });

      expect(result).toEqual(mockSession);
    });

    it('should handle missing user gracefully', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'John Doe',
        },
      };

      const result = await sessionCallback({
        session: mockSession,
        user: null,
      });

      expect(result).toEqual(mockSession);
    });
  });

  describe('JWT Callback', () => {
    let jwtCallback: any;

    beforeEach(() => {
      delete require.cache[require.resolve('../auth')];
      require('../auth');
      
      const NextAuth = require('next-auth');
      const config = NextAuth.mock.calls[0][0];
      jwtCallback = config.callbacks.jwt;
    });

    it('should add subscription tier to JWT token', async () => {
      const mockToken = {
        email: 'test@example.com',
        name: 'John Doe',
      };

      const mockUser = {
        subscriptionTier: 'premium',
      };

      const result = await jwtCallback({
        token: mockToken,
        user: mockUser,
      });

      expect(result).toEqual({
        email: 'test@example.com',
        name: 'John Doe',
        subscriptionTier: 'premium',
      });
    });

    it('should default to free subscription tier when not provided', async () => {
      const mockToken = {
        email: 'test@example.com',
        name: 'John Doe',
      };

      const mockUser = {};

      const result = await jwtCallback({
        token: mockToken,
        user: mockUser,
      });

      expect(result.subscriptionTier).toBe('free');
    });

    it('should handle missing user gracefully', async () => {
      const mockToken = {
        email: 'test@example.com',
        name: 'John Doe',
        existingProperty: 'preserved',
      };

      const result = await jwtCallback({
        token: mockToken,
      });

      expect(result).toEqual(mockToken);
    });

    it('should preserve existing token properties', async () => {
      const mockToken = {
        email: 'test@example.com',
        name: 'John Doe',
        existingProperty: 'value',
        exp: 1234567890,
      };

      const mockUser = {
        subscriptionTier: 'premium',
      };

      const result = await jwtCallback({
        token: mockToken,
        user: mockUser,
      });

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.existingProperty).toBe('value');
      expect(result.exp).toBe(1234567890);
      expect(result.subscriptionTier).toBe('premium');
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle missing environment variables', () => {
      const originalMongoUri = process.env.MONGODB_URI;
      const originalMongoDbName = process.env.MONGODB_DB_NAME;
      
      delete process.env.MONGODB_URI;
      delete process.env.MONGODB_DB_NAME;
      
      // Should not throw when environment variables are missing
      delete require.cache[require.resolve('../auth')];
      expect(() => require('../auth')).not.toThrow();
      
      process.env.MONGODB_URI = originalMongoUri;
      process.env.MONGODB_DB_NAME = originalMongoDbName;
    });
  });

  describe('Exported Functions', () => {
    it('should export required NextAuth functions', () => {
      delete require.cache[require.resolve('../auth')];
      const authModule = require('../auth');
      
      expect(authModule.handlers).toBeDefined();
      expect(authModule.auth).toBeDefined();
      expect(authModule.signIn).toBeDefined();
      expect(authModule.signOut).toBeDefined();
    });
  });
});