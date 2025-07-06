/**
 * Test helper utilities for combat utility tests
 * Reduces code duplication across test files
 */

import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import { IEncounter, IParticipantReference } from '@/lib/models/encounter/interfaces';

/**
 * Creates a test encounter with specified round and turn
 */
export function createActiveEncounter(round: number = 2, turn: number = 0): IEncounter {
  const encounter = createTestEncounter();
  makeEncounterActive(encounter);
  encounter.combatState.currentRound = round;
  encounter.combatState.currentTurn = turn;
  return encounter;
}

/**
 * Creates standard test participants
 */
export function createTestParticipants(): IParticipantReference[] {
  return [
    {
      characterId: PARTICIPANT_IDS.FIRST,
      name: 'Character 1',
      type: 'Player',
      maxHitPoints: 20,
      currentHitPoints: 15,
      temporaryHitPoints: 0,
      armorClass: 15,
      initiative: 20,
      isPlayer: true,
      isVisible: true,
      notes: '',
      conditions: []
    },
    {
      characterId: PARTICIPANT_IDS.SECOND,
      name: 'Character 2',
      type: 'NPC',
      maxHitPoints: 30,
      currentHitPoints: 30,
      temporaryHitPoints: 0,
      armorClass: 14,
      initiative: 15,
      isPlayer: false,
      isVisible: true,
      notes: '',
      conditions: []
    }
  ];
}

/**
 * Creates test encounter with participants attached
 */
export function createEncounterWithParticipants(round: number = 2, turn: number = 0): IEncounter {
  const encounter = createActiveEncounter(round, turn);
  encounter.participants = createTestParticipants();
  return encounter;
}

/**
 * Creates test participant with conditions
 */
export function createParticipantWithConditions(conditions: string[] = ['Poisoned', 'Prone']): IParticipantReference {
  return {
    characterId: PARTICIPANT_IDS.FIRST,
    name: 'Conditioned Character',
    type: 'Player',
    maxHitPoints: 25,
    currentHitPoints: 20,
    temporaryHitPoints: 5,
    armorClass: 16,
    initiative: 18,
    isPlayer: true,
    isVisible: true,
    notes: 'Test notes',
    conditions
  };
}

/**
 * Mock fetch response factory
 */
export function createMockResponse(success: boolean = true, encounter: any = null) {
  return {
    ok: success,
    json: jest.fn().mockResolvedValue({
      success,
      encounter
    })
  };
}

/**
 * Mock fetch error response factory
 */
export function createMockErrorResponse(message: string = 'API Error Message') {
  return {
    ok: false,
    json: jest.fn().mockResolvedValue({ message })
  };
}

/**
 * Creates mock callback functions for API operations
 */
export function createMockCallbacks() {
  return {
    setIsLoading: jest.fn(),
    setError: jest.fn(),
    onEncounterUpdate: jest.fn()
  };
}

/**
 * Setup DOM mocks for browser APIs
 */
export function setupDOMMocks() {
  const mockTextArea = {
    value: '',
    focus: jest.fn(),
    select: jest.fn(),
  };

  const mockLink = {
    href: '',
    download: '',
    click: jest.fn(),
  };

  // Mock document methods
  document.createElement = jest.fn((element) => {
    if (element === 'textarea') return mockTextArea;
    if (element === 'a') return mockLink;
    return {};
  });

  document.body.appendChild = jest.fn();
  document.body.removeChild = jest.fn();
  document.execCommand = jest.fn();

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(),
    },
  });

  // Mock URL API
  global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock Blob
  global.Blob = jest.fn().mockImplementation((content, options) => ({
    content,
    options,
  })) as any;

  return { mockTextArea, mockLink };
}

/**
 * Resets all DOM mocks
 */
export function resetDOMMocks() {
  jest.clearAllMocks();
  (navigator.clipboard.writeText as jest.Mock).mockClear();
  (document.createElement as jest.Mock).mockClear();
  (document.body.appendChild as jest.Mock).mockClear();
  (document.body.removeChild as jest.Mock).mockClear();
  (document.execCommand as jest.Mock).mockClear();
  (URL.createObjectURL as jest.Mock).mockClear();
  (URL.revokeObjectURL as jest.Mock).mockClear();
  (global.Blob as jest.Mock).mockClear();
}

/**
 * Creates successful fetch mock response for API tests
 */
export function createSuccessfulFetchMock(encounter: any) {
  return {
    ok: true,
    json: () => Promise.resolve({ success: true, encounter })
  };
}

/**
 * Sets up global fetch mock with successful response
 */
export function setupSuccessfulFetchMock(encounter: any) {
  (global.fetch as jest.Mock).mockResolvedValueOnce(createSuccessfulFetchMock(encounter));
}

/**
 * Creates complete encounter with participants for hook testing
 */
export function createEncounterForHookTesting(): IEncounter {
  const encounter = createActiveEncounter(2, 1);
  encounter.participants = createTestParticipants();
  return encounter;
}

/**
 * Creates mock handlers props for useInitiativeTracker tests
 */
export function createInitiativeTrackerProps(encounter: IEncounter, onUpdate?: jest.Mock) {
  return {
    encounter,
    onEncounterUpdate: onUpdate || jest.fn()
  };
}