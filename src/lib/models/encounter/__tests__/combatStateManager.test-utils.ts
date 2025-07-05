import { Types } from 'mongoose';
import { IEncounter, IParticipantReference } from '../interfaces';

/**
 * Shared test utilities for combatStateManager tests
 * Reduces code duplication across test files
 */

// Mock encounter object for testing
export const createMockEncounter = (): IEncounter => ({
  _id: new Types.ObjectId(),
  ownerId: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'Test description',
  tags: [],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  status: 'draft',
  participants: [],
  combatState: {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  },
  settings: {
    allowPlayerVisibility: true,
    autoRollInitiative: false,
    trackResources: true,
    enableLairActions: false,
    enableGridMovement: false,
    gridSize: 5,
  },
  isPublic: false,
  participantCount: 0,
  playerCount: 0,
  isActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  toObject: jest.fn().mockReturnValue({}),
  constructor: jest.fn(),
  // Methods bound to the encounter
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
  currentParticipant: null,
  sharedWith: [],
});

export const createMockParticipant = (): IParticipantReference => ({
  characterId: new Types.ObjectId(),
  name: 'Test Character',
  type: 'pc',
  maxHitPoints: 100,
  currentHitPoints: 80,
  temporaryHitPoints: 0,
  armorClass: 15,
  isPlayer: true,
  isVisible: true,
  notes: '',
  conditions: [],
});

// Test helper functions to reduce duplication
export const createValidationTestParticipant = (overrides: any = {}) => ({
  participantId: new Types.ObjectId('507f1f77bcf86cd799439011'),
  initiative: 15,
  dexterity: 14,
  isActive: false,
  hasActed: false,
  ...overrides,
});

export const setupActiveEncounter = (encounter: IEncounter) => {
  encounter.combatState.isActive = true;
  encounter.combatState.currentRound = 2;
  encounter.combatState.currentTurn = 0;
  encounter.combatState.initiativeOrder = [
    createValidationTestParticipant({
      participantId: new Types.ObjectId('507f1f77bcf86cd799439011'),
      initiative: 20,
      dexterity: 15,
      isActive: true,
    }),
    createValidationTestParticipant({
      participantId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      initiative: 15,
      dexterity: 12,
    }),
  ];
};

export const testWithoutWindow = (testFn: () => void) => {
  const originalWindow = global.window;
  delete (global as any).window;
  try {
    testFn();
  } finally {
    global.window = originalWindow;
  }
};