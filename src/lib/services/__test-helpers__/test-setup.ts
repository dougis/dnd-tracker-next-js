/**
 * Shared test setup and mocks for UserService tests
 */

// Mock the User model
jest.mock('../../models/User', () => ({
  User: jest.fn().mockImplementation(() => ({
    generateEmailVerificationToken: jest.fn(),
    save: jest.fn(),
    toPublicJSON: jest.fn(),
  })),
}));

// Add static methods to the mocked User constructor
const MockedUser = jest.mocked(require('../../models/User').User);
MockedUser.findByEmail = jest.fn();
MockedUser.findByUsername = jest.fn();
MockedUser.findById = jest.fn();
MockedUser.findByResetToken = jest.fn();
MockedUser.findByVerificationToken = jest.fn();
MockedUser.find = jest.fn();
MockedUser.countDocuments = jest.fn();
MockedUser.aggregate = jest.fn();
MockedUser.findByIdAndDelete = jest.fn();

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Export mocked user for tests
export const mockUser = MockedUser;

// Mock user data
export const mockUserData = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: '$2b$12$hashedPassword',
  role: 'user' as const,
  subscriptionTier: 'free' as const,
  preferences: {
    theme: 'system' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  comparePassword: jest.fn(),
  generatePasswordResetToken: jest.fn(),
  generateEmailVerificationToken: jest.fn(),
  updateLastLogin: jest.fn(),
  save: jest.fn(),
  toPublicJSON: jest.fn(),
};
