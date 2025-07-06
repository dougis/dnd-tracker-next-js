import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { Character } from '@/lib/models/Character';
import { EncounterService } from '@/lib/services/EncounterService';

/**
 * API Test Helpers for Initiative Rolling
 * Eliminates code duplication across API test files
 */

// Standard test IDs for consistent testing
export const API_TEST_IDS = {
  ENCOUNTER: new Types.ObjectId('507f1f77bcf86cd799439000'),
  FIGHTER: new Types.ObjectId('507f1f77bcf86cd799439011'),
  ROGUE: new Types.ObjectId('507f1f77bcf86cd799439012'),
  WIZARD: new Types.ObjectId('507f1f77bcf86cd799439013'),
} as const;

// Mock character factory
export const createMockCharacter = (
  overrides?: Partial<{
    _id: Types.ObjectId;
    name: string;
    abilityScores: { dexterity: number };
  }>
) => ({
  _id: new Types.ObjectId(),
  name: 'Test Character',
  abilityScores: { dexterity: 14 },
  ...overrides,
});

// Predefined character sets
export const createFighterCharacter = () =>
  createMockCharacter({
    _id: API_TEST_IDS.FIGHTER,
    name: 'Fighter',
    abilityScores: { dexterity: 14 },
  });

export const createRogueCharacter = () =>
  createMockCharacter({
    _id: API_TEST_IDS.ROGUE,
    name: 'Rogue',
    abilityScores: { dexterity: 18 },
  });

export const createBasicCharacterSet = () => [
  createFighterCharacter(),
  createRogueCharacter(),
];

// Mock encounter factory
export const createMockEncounter = (overrides?: any) => {
  const characters = createBasicCharacterSet();

  return {
    _id: API_TEST_IDS.ENCOUNTER,
    participants: [
      {
        characterId: characters[0]._id,
        name: characters[0].name,
        type: 'pc',
      },
      {
        characterId: characters[1]._id,
        name: characters[1].name,
        type: 'pc',
      },
    ],
    combatState: {
      isActive: true,
      currentRound: 1,
      currentTurn: 0,
      initiativeOrder: [],
    },
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
};

// Mock initiative entry factory
export const createMockInitiativeEntry = (
  participantId: Types.ObjectId,
  name: string,
  overrides?: any
) => ({
  participantId,
  initiative: 16,
  dexterity: 14,
  isActive: false,
  hasActed: false,
  name,
  type: 'pc',
  ...overrides,
});

// Predefined initiative entries
export const createBasicInitiativeEntries = () => [
  createMockInitiativeEntry(
    API_TEST_IDS.ROGUE,
    'Rogue',
    { initiative: 22, dexterity: 18 }
  ),
  createMockInitiativeEntry(
    API_TEST_IDS.FIGHTER,
    'Fighter',
    { initiative: 16, dexterity: 14 }
  ),
];

// NextRequest factory
export const createMockNextRequest = (body: any = {}) => {
  return new NextRequest('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// Mock parameters factory
export const createMockParams = (encounterId?: string) => ({
  params: Promise.resolve({
    id: encounterId || API_TEST_IDS.ENCOUNTER.toString()
  })
});

// Common mock setup function
export const setupBasicMocks = () => {
  const mockCharacters = createBasicCharacterSet();
  const mockEncounter = createMockEncounter();

  // Mock EncounterService
  (EncounterService.getEncounterById as jest.Mock).mockResolvedValue({
    success: true,
    data: mockEncounter,
  });

  // Mock Character model
  (Character.find as jest.Mock).mockResolvedValue(mockCharacters);
  (Character.findById as jest.Mock).mockImplementation((id) => {
    return Promise.resolve(
      mockCharacters.find(c => c._id.toString() === id.toString())
    );
  });

  return { mockCharacters, mockEncounter };
};

// Setup mocks for reroll tests
export const setupRerollMocks = () => {
  const { mockCharacters, mockEncounter } = setupBasicMocks();

  // Add existing initiative order
  mockEncounter.combatState.initiativeOrder = [
    {
      participantId: API_TEST_IDS.ROGUE,
      initiative: 22,
      dexterity: 18,
      isActive: true,
      hasActed: false,
    },
    {
      participantId: API_TEST_IDS.FIGHTER,
      initiative: 16,
      dexterity: 14,
      isActive: false,
      hasActed: true,
    },
  ];
  mockEncounter.combatState.isActive = true;
  mockEncounter.combatState.currentTurn = 0;

  return { mockCharacters, mockEncounter };
};

// Common assertion helpers
export const expectSuccessfulResponse = (result: any) => {
  expect(result.success).toBe(true);
  expect(result.encounter).toBeDefined();
};

export const expectErrorResponse = (result: any, expectedError: string) => {
  expect(result.success).toBe(false);
  expect(result.error).toContain(expectedError);
};

export const expectEncounterSaved = (mockEncounter: any) => {
  expect(mockEncounter.save).toHaveBeenCalled();
};

export const expectInitiativeOrderLength = (mockEncounter: any, expectedLength: number) => {
  expect(mockEncounter.combatState.initiativeOrder).toHaveLength(expectedLength);
};

export const expectActiveParticipant = (mockEncounter: any, expectedIndex: number) => {
  expect(mockEncounter.combatState.initiativeOrder[expectedIndex].isActive).toBe(true);
  expect(mockEncounter.combatState.currentTurn).toBe(expectedIndex);
};

export const expectFunctionCalled = (mockFn: jest.Mock, expectedArgs?: any[]) => {
  expect(mockFn).toHaveBeenCalled();
  if (expectedArgs && expectedArgs.length > 0) {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  }
};

// Test scenario builders
export const buildRollAllScenario = () => ({
  request: createMockNextRequest({ rollAll: true }),
  mockInitiativeEntries: createBasicInitiativeEntries(),
});

export const buildSingleRollScenario = (participantId?: string) => ({
  request: createMockNextRequest({
    participantId: participantId || API_TEST_IDS.FIGHTER.toString(),
    rollAll: false
  }),
  mockUpdatedOrder: [
    createMockInitiativeEntry(
      API_TEST_IDS.FIGHTER,
      'Fighter',
      { initiative: 16, dexterity: 14 }
    ),
  ],
});

export const buildRerollScenario = (participantId?: string) => ({
  request: createMockNextRequest(
    participantId ? { participantId } : {}
  ),
  mockRerolledOrder: [
    createMockInitiativeEntry(
      API_TEST_IDS.FIGHTER,
      'Fighter',
      { initiative: 20, dexterity: 14, hasActed: true }
    ),
    createMockInitiativeEntry(
      API_TEST_IDS.ROGUE,
      'Rogue',
      { initiative: 18, dexterity: 18, hasActed: false }
    ),
  ],
});

// Error scenario builders
export const buildMissingParticipantScenario = () => {
  const nonExistentId = new Types.ObjectId().toString();
  return {
    request: createMockNextRequest({
      participantId: nonExistentId
    }),
    expectedError: 'not found',
    setup: () => {
      // Ensure combat is active but participant doesn't exist in encounter
      const { mockEncounter } = setupBasicMocks();
      mockEncounter.combatState.isActive = true;
      // The participant ID in the request won't match any in the encounter
      return { mockEncounter };
    }
  };
};

export const buildMissingCharacterScenario = () => {
  return {
    request: createMockNextRequest({
      participantId: API_TEST_IDS.FIGHTER.toString()
    }),
    expectedError: 'Character',
    setup: () => {
      // Ensure combat is active and participant exists but character doesn't
      const { mockEncounter } = setupBasicMocks();
      mockEncounter.combatState.isActive = true;
      // Override Character.findById to return null for the specific character
      (Character.findById as jest.Mock).mockResolvedValue(null);
      return { mockEncounter };
    }
  };
};

export const buildEmptyInitiativeScenario = () => {
  const { mockEncounter } = setupBasicMocks();
  mockEncounter.combatState.initiativeOrder = [];

  return {
    request: createMockNextRequest({}),
    expectedError: 'No initiative order found',
    mockEncounter,
  };
};

// Mock initiative rolling functions
export const mockInitiativeRollingFunctions = () => {
  const { rollBulkInitiative, rollSingleInitiative, rerollInitiative } =
    jest.requireMock('@/lib/models/encounter/initiative-rolling');

  return {
    rollBulkInitiative,
    rollSingleInitiative,
    rerollInitiative,
  };
};

// Test cleanup
export const cleanupApiTest = () => {
  jest.clearAllMocks();
};

// Common test flow helpers
export const runBasicApiTest = async (
  handler: Function,
  request: NextRequest,
  params: any,
  expectations: (_result: any) => void
) => {
  const response = await handler(request, params);
  const result = await response.json();
  expectations(result);
  return { response, result };
};

export const runErrorApiTest = async (
  handler: Function,
  request: NextRequest,
  params: any,
  expectedStatus: number,
  expectedError: string
) => {
  const response = await handler(request, params);
  const result = await response.json();

  expect(response.status).toBe(expectedStatus);
  expectErrorResponse(result, expectedError);

  return { response, result };
};

// Common test execution patterns
export const setupMocksAndRunTest = async (
  handler: Function,
  request: NextRequest,
  mockFunctions: { [key: string]: jest.Mock },
  mockReturnValues: { [key: string]: any },
  expectations: (_result: any) => void
) => {
  // Setup all mocks
  Object.keys(mockReturnValues).forEach(funcName => {
    mockFunctions[funcName].mockReturnValue(mockReturnValues[funcName]);
  });

  return await runBasicApiTest(handler, request, createMockParams(), expectations);
};

export const expectFunctionCallCounts = (
  functions: { [key: string]: jest.Mock },
  expectedCounts: { [key: string]: number }
) => {
  Object.keys(expectedCounts).forEach(funcName => {
    expect(functions[funcName].mock.calls.length).toBe(expectedCounts[funcName]);
  });
};

export const expectAtLeastOneFunctionCalled = (functions: jest.Mock[]) => {
  const totalCalls = functions.reduce((sum, fn) => sum + fn.mock.calls.length, 0);
  expect(totalCalls).toBeGreaterThan(0);
};