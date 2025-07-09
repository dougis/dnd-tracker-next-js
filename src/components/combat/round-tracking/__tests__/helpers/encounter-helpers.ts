import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';

/**
 * Encounter creation utilities for round tracking tests
 */

export function createMockEncounterWithRound(round: number): IEncounter {
  const encounter = createTestEncounter();
  encounter.combatState.isActive = true;
  encounter.combatState.currentRound = round;
  encounter.combatState.currentTurn = 0;
  encounter.combatState.startedAt = new Date(Date.now() - (round * 60000)); // 1 minute per round
  return encounter;
}

export function createMockEncounterWithStartTime(minutesAgo: number): IEncounter {
  const encounter = createTestEncounter();
  makeEncounterActive(encounter);
  encounter.combatState.startedAt = new Date(Date.now() - minutesAgo * 60000);
  return encounter;
}

// Component testing utilities
export interface RoundTrackerMocks {
  onRoundChange: jest.Mock;
  onEffectExpiry: jest.Mock;
  onTriggerAction: jest.Mock;
  onExport: jest.Mock;
}

export function createRoundTrackerMocks(): RoundTrackerMocks {
  return {
    onRoundChange: jest.fn(),
    onEffectExpiry: jest.fn(),
    onTriggerAction: jest.fn(),
    onExport: jest.fn(),
  };
}

export function setupRoundTrackerTest(roundNumber = 2) {
  const encounter = createMockEncounterWithRound(roundNumber);
  const mocks = createRoundTrackerMocks();

  const defaultProps = {
    encounter,
    ...mocks,
  };

  return { encounter, mocks, defaultProps };
}

export function setupRoundTrackerHooks() {
  const { encounter, mocks } = setupRoundTrackerTest();

  beforeEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  return { encounter, mocks };
}

// Hook testing utilities
export function createUseRoundTrackingMocks() {
  return {
    onUpdate: jest.fn(),
    onEffectExpiry: jest.fn(),
    onTriggerActivation: jest.fn(),
  };
}

export function setupRoundTrackingHook(
  encounter: IEncounter = createMockEncounterWithRound(2),
  options: any = {}
) {
  const mocks = createUseRoundTrackingMocks();

  const hookOptions = {
    initialEffects: [],
    initialTriggers: [],
    maxHistoryRounds: 10,
    ...options,
  };

  return { encounter, mocks, hookOptions };
}