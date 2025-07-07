import { Types } from 'mongoose';
import { NextRequest } from 'next/server';
import { Character } from '@/lib/models/Character';
import { EncounterService } from '@/lib/services/EncounterService';
import { IParticipantWithAbilityScores, InitiativeEntryWithInfo } from '../initiative-rolling';
import { IInitiativeEntry } from '../interfaces';

/**
 * Unified Base Test Helpers for Initiative System
 * Eliminates code duplication across all test files
 */

// Standard test IDs used across all tests
export const TEST_IDS = {
  ENCOUNTER: new Types.ObjectId('507f1f77bcf86cd799439000'),
  FIGHTER: new Types.ObjectId('507f1f77bcf86cd799439011'),
  ROGUE: new Types.ObjectId('507f1f77bcf86cd799439012'),
  ORC: new Types.ObjectId('507f1f77bcf86cd799439013'),
} as const;

/**
 * Standard ability score configurations
 */
export const ABILITY_SCORES = {
  FIGHTER: { strength: 16, dexterity: 14, constitution: 16, intelligence: 10, wisdom: 12, charisma: 8 },
  ROGUE: { strength: 10, dexterity: 18, constitution: 14, intelligence: 12, wisdom: 14, charisma: 10 },
  ORC: { strength: 16, dexterity: 12, constitution: 16, intelligence: 7, wisdom: 11, charisma: 10 },
} as const;

/**
 * Configurable participant factory - eliminates multiple specific factories
 */
export interface ParticipantConfig {
  id?: Types.ObjectId;
  name: string;
  type: 'pc' | 'npc' | 'monster';
  dexterity: number;
  hitPoints?: number;
  armorClass?: number;
  isPlayer?: boolean;
  isVisible?: boolean;
  initiative?: number;
}

export function createParticipant(config: ParticipantConfig): IParticipantWithAbilityScores {
  return {
    characterId: config.id || new Types.ObjectId(),
    name: config.name,
    type: config.type,
    initiative: config.initiative || 0,
    armorClass: config.armorClass || 15,
    maxHitPoints: config.hitPoints || 30,
    currentHitPoints: config.hitPoints || 30,
    temporaryHitPoints: 0,
    conditions: [],
    notes: '',
    isPlayer: config.isPlayer ?? (config.type === 'pc'),
    isVisible: config.isVisible ?? true,
    abilityScores: {
      strength: 10,
      dexterity: config.dexterity,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 10,
    },
  };
}

/**
 * Pre-configured standard participants
 */
export const createStandardParticipants = () => ({
  fighter: createParticipant({
    id: TEST_IDS.FIGHTER,
    name: 'Fighter',
    type: 'pc',
    dexterity: 14,
    hitPoints: 45,
    armorClass: 18,
    isPlayer: false,
  }),
  rogue: createParticipant({
    id: TEST_IDS.ROGUE,
    name: 'Rogue',
    type: 'pc',
    dexterity: 18,
    hitPoints: 38,
    armorClass: 15,
    isPlayer: true,
  }),
  orc: createParticipant({
    id: TEST_IDS.ORC,
    name: 'Orc Warrior',
    type: 'npc',
    dexterity: 12,
    hitPoints: 15,
    armorClass: 13,
    isPlayer: false,
  }),
});

/**
 * Unified mock setup function - eliminates repetitive mock setup
 */
export function setupTestMocks() {
  const participants = createStandardParticipants();
  const characters = [
    { _id: TEST_IDS.FIGHTER, name: 'Fighter', abilityScores: ABILITY_SCORES.FIGHTER },
    { _id: TEST_IDS.ROGUE, name: 'Rogue', abilityScores: ABILITY_SCORES.ROGUE },
    { _id: TEST_IDS.ORC, name: 'Orc Warrior', abilityScores: ABILITY_SCORES.ORC },
  ];

  const encounter = {
    _id: TEST_IDS.ENCOUNTER,
    participants: [
      { characterId: TEST_IDS.FIGHTER, name: 'Fighter', type: 'pc' },
      { characterId: TEST_IDS.ROGUE, name: 'Rogue', type: 'pc' },
    ],
    combatState: {
      isActive: true,
      currentRound: 1,
      currentTurn: 0,
      initiativeOrder: [],
    },
    save: jest.fn().mockResolvedValue(true),
  };

  // Setup all mocks
  (EncounterService.getEncounterById as jest.Mock).mockResolvedValue({
    success: true,
    data: encounter,
  });

  (Character.find as jest.Mock).mockResolvedValue(characters);
  (Character.findById as jest.Mock).mockImplementation((id) => {
    return Promise.resolve(
      characters.find(c => c._id.toString() === id.toString())
    );
  });

  return { participants, characters, encounter };
}

/**
 * Unified mock reset function
 */
export function resetTestMocks() {
  jest.clearAllMocks();

  // Reset specific mocks if they exist
  try {
    const mockRoll = jest.requireMock('../utils').rollInitiative;
    mockRoll.mockClear();
    mockRoll.mockReturnValue(10);
  } catch {
    // Mock doesn't exist, ignore
  }
}

/**
 * Unified mock request factory
 */
export function createMockRequest(body: any = {}, method: string = 'POST'): NextRequest {
  return new NextRequest('http://localhost:3000', {
    method,
    body: JSON.stringify(body),
  });
}

/**
 * Unified mock parameters factory
 */
export function createMockParams(encounterId?: string) {
  return {
    params: Promise.resolve({
      id: encounterId || TEST_IDS.ENCOUNTER.toString()
    })
  };
}

/**
 * Configurable initiative entry factory
 */
export interface InitiativeEntryConfig {
  participantId: Types.ObjectId;
  initiative?: number;
  dexterity?: number;
  isActive?: boolean;
  hasActed?: boolean;
  name?: string;
  type?: 'pc' | 'npc' | 'monster';
}

export function createInitiativeEntry(config: InitiativeEntryConfig): IInitiativeEntry {
  return {
    participantId: config.participantId,
    initiative: config.initiative || 10,
    dexterity: config.dexterity || 12,
    isActive: config.isActive || false,
    hasActed: config.hasActed || false,
  };
}

/**
 * Unified assertion helpers - eliminates repetitive assertions
 */
export const TestAssertions = {
  successfulResponse: (result: any) => {
    expect(result.success).toBe(true);
    expect(result.encounter).toBeDefined();
  },

  errorResponse: (result: any, expectedError: string) => {
    expect(result.success).toBe(false);
    expect(result.error).toContain(expectedError);
  },

  encounterSaved: (mockEncounter: any) => {
    expect(mockEncounter.save).toHaveBeenCalled();
  },

  initiativeOrderLength: (mockEncounter: any, expectedLength: number) => {
    expect(mockEncounter.combatState.initiativeOrder).toHaveLength(expectedLength);
  },

  activeParticipant: (mockEncounter: any, expectedIndex: number) => {
    expect(mockEncounter.combatState.initiativeOrder[expectedIndex].isActive).toBe(true);
    expect(mockEncounter.combatState.currentTurn).toBe(expectedIndex);
  },

  initiativeEntryStructure: (
    entry: IInitiativeEntry | InitiativeEntryWithInfo,
    expected: Partial<InitiativeEntryConfig>
  ) => {
    // Validate expected values using helper functions to reduce complexity
    validateExpectedFields(entry, expected);
    validateEntryTypes(entry);
  },

  validInitiativeOrder: (entries: IInitiativeEntry[]) => {
    for (let i = 0; i < entries.length - 1; i++) {
      const current = entries[i];
      const next = entries[i + 1];

      if (current.initiative === next.initiative) {
        expect(current.dexterity).toBeGreaterThanOrEqual(next.dexterity);
      } else {
        expect(current.initiative).toBeGreaterThan(next.initiative);
      }
    }
  },

  functionCalled: (mockFn: jest.Mock, expectedArgs?: any[]) => {
    expect(mockFn).toHaveBeenCalled();
    if (expectedArgs && expectedArgs.length > 0) {
      expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
    }
  },
};

/**
 * Mock roll utilities - eliminates duplicated mock setup
 */
export const MockRollUtils = {
  setupSingle: (mockRoll: jest.Mock, returnValue: number) => {
    mockRoll.mockReturnValueOnce(returnValue);
  },

  setupSequential: (mockRoll: jest.Mock, values: number[]) => {
    let mockChain = mockRoll;
    values.forEach(value => {
      mockChain = mockChain.mockReturnValueOnce(value);
    });
  },

  reset: () => {
    try {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll.mockClear();
      mockRoll.mockReturnValue(10);
    } catch {
      // Mock doesn't exist, ignore
    }
  },
};

/**
 * Common test environment setup
 */
export function setupTestEnvironment() {
  beforeEach(() => {
    resetTestMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
}

/**
 * API test helper patterns
 */
/**
 * Helper functions to reduce complexity in TestAssertions
 */
function validateExpectedFields(
  entry: IInitiativeEntry | InitiativeEntryWithInfo,
  expected: Partial<InitiativeEntryConfig>
): void {
  const checks = [
    { key: 'participantId', assertion: (val: any) => expect(entry.participantId).toEqual(val) },
    { key: 'dexterity', assertion: (val: any) => expect(entry.dexterity).toBe(val) },
    { key: 'isActive', assertion: (val: any) => expect(entry.isActive).toBe(val) },
    { key: 'hasActed', assertion: (val: any) => expect(entry.hasActed).toBe(val) },
    { key: 'initiative', assertion: (val: any) => expect(entry.initiative).toBe(val) }
  ];

  checks.forEach(({ key, assertion }) => {
    if (expected[key as keyof InitiativeEntryConfig] !== undefined) {
      assertion(expected[key as keyof InitiativeEntryConfig]);
    }
  });
}

function validateEntryTypes(entry: IInitiativeEntry | InitiativeEntryWithInfo): void {
  expect(typeof entry.initiative).toBe('number');
  expect(typeof entry.participantId).toBe('object');
  expect(typeof entry.dexterity).toBe('number');
  expect(typeof entry.isActive).toBe('boolean');
  expect(typeof entry.hasActed).toBe('boolean');
}

export const APITestUtils = {
  runBasicTest: async (
    handler: Function,
    request: NextRequest,
    params: any,
    expectations: (_result: any) => void
  ) => {
    const response = await handler(request, params);
    const result = await response.json();
    expectations(result);
    return { response, result };
  },

  runErrorTest: async (
    handler: Function,
    request: NextRequest,
    params: any,
    expectedStatus: number,
    expectedError: string
  ) => {
    const response = await handler(request, params);
    const result = await response.json();

    expect(response.status).toBe(expectedStatus);
    TestAssertions.errorResponse(result, expectedError);

    return { response, result };
  },
};