import type { PublicUser } from '@/lib/validations/user';
import type {
  IEncounter,
  IParticipantReference,
  IEncounterSettings,
  ICombatState
} from '@/lib/models/encounter/interfaces';
import { Types } from 'mongoose';

/**
 * Mock data factory functions for creating test data
 */

// Mock data factories
export const createMockUser = (overrides: Partial<any> = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  subscriptionTier: 'free',
  isEmailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockUsers = (count: number = 2) =>
  Array.from({ length: count }, (_, i) =>
    createMockUser({
      _id: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      username: `user${i + 1}`,
    })
  );

export const createPublicUser = (
  overrides: Partial<PublicUser> = {}
): PublicUser => ({
  id: 'user1',
  email: 'user1@example.com',
  username: 'user1',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  subscriptionTier: 'free',
  isEmailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  preferences: {
    theme: 'system',
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  },
  ...overrides,
});

// User conflict testing utilities
export const createExistingUserWithEmail = (email: string, userId?: string) =>
  createMockUser({
    _id: userId || 'existing-user-id',
    email,
  });

export const createExistingUserWithUsername = (
  username: string,
  userId?: string
) =>
  createMockUser({
    _id: userId || 'existing-user-id',
    username,
  });

export const createUserWithObjectId = (userId: string, overrides: any = {}) =>
  createMockUser({
    _id: { toString: () => userId },
    ...overrides,
  });

// Test data for UserServiceResponseHelpers
export const createTestToken = (
  type: 'normal' | 'empty' | 'long' = 'normal'
) => {
  const tokenMap = {
    normal: 'secure-token-123',
    empty: '',
    long: 'a'.repeat(1000),
  };
  return tokenMap[type];
};

export const createTestData = (
  type: 'simple' | 'array' | 'typed' = 'simple'
) => {
  const dataMap = {
    simple: { id: '123', name: 'Test' },
    array: [1, 2, 3],
    typed: { count: 42, items: ['a', 'b', 'c'] },
  };
  return dataMap[type];
};

// Encounter data factories
export const createParticipant = (overrides: Partial<IParticipantReference> = {}): IParticipantReference => ({
  characterId: new Types.ObjectId('64a1b2c3d4e5f6789abcdef0'),
  name: 'Test Character',
  type: 'pc',
  maxHitPoints: 20,
  currentHitPoints: 20,
  temporaryHitPoints: 0,
  armorClass: 12,
  initiative: 10,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
  position: { x: 0, y: 0 },
  ...overrides,
});

export const createEncounterSettings = (overrides: Partial<IEncounterSettings> = {}): IEncounterSettings => ({
  allowPlayerVisibility: true,
  autoRollInitiative: false,
  trackResources: true,
  enableLairActions: false,
  enableGridMovement: false,
  gridSize: 5,
  ...overrides,
});

export const createCombatState = (overrides: Partial<ICombatState> = {}): ICombatState => ({
  isActive: false,
  currentRound: 0,
  currentTurn: 0,
  initiativeOrder: [],
  totalDuration: 0,
  ...overrides,
});

export const createEncounter = (overrides: Partial<IEncounter> = {}): IEncounter => ({
  _id: new Types.ObjectId('64a1b2c3d4e5f6789abcdef9'),
  ownerId: new Types.ObjectId('507f1f77bcf86cd799439011'),
  name: 'Test Encounter',
  description: 'A test encounter for unit tests',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  participants: [],
  settings: createEncounterSettings(),
  combatState: createCombatState(),
  status: 'draft',
  isPublic: false,
  sharedWith: [],
  version: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  // Virtual properties
  get participantCount() { return this.participants.length; },
  get playerCount() { return this.participants.filter(p => p.isPlayer).length; },
  get isActive() { return this.combatState.isActive; },
  get currentParticipant() { return null; },
  // Mock methods for testing
  addParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  updateParticipant: jest.fn(),
  getParticipant: jest.fn(),
  startCombat: jest.fn(),
  endCombat: jest.fn(),
  nextTurn: jest.fn(),
  previousTurn: jest.fn(),
  setInitiative: jest.fn(),
  applyDamage: jest.fn(),
  applyHealing: jest.fn(),
  addCondition: jest.fn(),
  removeCondition: jest.fn(),
  getInitiativeOrder: jest.fn(),
  calculateDifficulty: jest.fn(),
  duplicateEncounter: jest.fn(),
  toSummary: jest.fn(),
  ...overrides,
} as IEncounter);

export const testDataFactories = {
  createMockUser,
  createMockUsers,
  createPublicUser,
  createExistingUserWithEmail,
  createExistingUserWithUsername,
  createUserWithObjectId,
  createTestToken,
  createTestData,
  createParticipant,
  createEncounterSettings,
  createCombatState,
  createEncounter,
};

// Common test data constants
export const TEST_USER_ID = '507f1f77bcf86cd799439011';
export const TEST_EMAIL = 'test@example.com';
export const TEST_USERNAME = 'testuser';
export const TEST_DATE = new Date('2024-01-01');
