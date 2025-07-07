import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { Character } from '@/lib/models/Character';
// Removed unused import: EncounterService
import {
  TEST_IDS,
  setupTestMocks,
  createMockRequest,
  createMockParams,
  TestAssertions,
  APITestUtils
} from '@/lib/models/encounter/__tests__/base-test-helpers';

/**
 * API Test Helpers for Initiative Rolling
 * Built on unified base helpers to eliminate duplication
 */

// Re-export for backward compatibility
export const API_TEST_IDS = TEST_IDS;

/**
 * Simplified factories using unified base helpers
 */
export const createMockEncounter = (overrides?: any) => {
  const { encounter } = setupTestMocks();
  return { ...encounter, ...overrides };
};

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

export const createBasicInitiativeEntries = () => [
  createMockInitiativeEntry(
    TEST_IDS.ROGUE,
    'Rogue',
    { initiative: 22, dexterity: 18 }
  ),
  createMockInitiativeEntry(
    TEST_IDS.FIGHTER,
    'Fighter',
    { initiative: 16, dexterity: 14 }
  ),
];

// Use unified helpers
export const createMockNextRequest = createMockRequest;
export { createMockParams };

// Simplified mock setup using unified helpers
export const setupBasicMocks = () => {
  const { participants, characters, encounter } = setupTestMocks();
  return {
    mockCharacters: characters,
    mockEncounter: encounter,
    mockParticipants: participants
  };
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

// Use unified assertion helpers
export const expectSuccessfulResponse = TestAssertions.successfulResponse;
export const expectErrorResponse = TestAssertions.errorResponse;
export const expectEncounterSaved = TestAssertions.encounterSaved;
export const expectInitiativeOrderLength = TestAssertions.initiativeOrderLength;
export const expectActiveParticipant = TestAssertions.activeParticipant;
export const expectFunctionCalled = TestAssertions.functionCalled;

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
      // The participant ID in the request won't match any in the encounter
      // setupBasicMocks() was already called in beforeEach
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
      // Override Character.findById to return null for the specific character
      (Character.findById as jest.Mock).mockResolvedValue(null);
    }
  };
};

export const buildEmptyInitiativeScenario = () => {
  return {
    request: createMockNextRequest({}),
    expectedError: 'No initiative order found',
    setup: () => {
      // Mock will be set up in beforeEach, but we need to clear initiative order
      // This will be handled in the test itself
    }
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

// Use unified test utilities
export const cleanupApiTest = () => {
  jest.clearAllMocks();
};

export const runBasicApiTest = APITestUtils.runBasicTest;
export const runErrorApiTest = APITestUtils.runErrorTest;

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