import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  performRoundAction,
  assertRoundState,
  assertNoUpdate,
  assertError,
  assertNoError,
  createMockEncounterWithRound,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Round Management', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
  });

  describe('Round Management', () => {
    it('initializes with current round from encounter', () => {
      const { result } = setupRoundTrackingTest();
      expect(result.current.currentRound).toBe(2);
    });

    it('advances to next round', () => {
      const { result, mockOnUpdate } = setupRoundTrackingTest();
      performRoundAction(result, 'nextRound');
      assertRoundState(result, 3, mockOnUpdate);
    });

    it('goes to previous round', () => {
      const encounter = createMockEncounterWithRound(3);
      const { result, mockOnUpdate } = setupRoundTrackingTest(encounter);
      performRoundAction(result, 'previousRound');
      assertRoundState(result, 2, mockOnUpdate);
    });

    it('does not go below round 1', () => {
      const encounter = createMockEncounterWithRound(1);
      const { result, mockOnUpdate } = setupRoundTrackingTest(encounter);
      performRoundAction(result, 'previousRound');
      assertRoundState(result, 1);
      assertNoUpdate(mockOnUpdate);
    });

    it('sets specific round number', () => {
      const { result, mockOnUpdate } = setupRoundTrackingTest();
      performRoundAction(result, 'setRound', 5);
      assertRoundState(result, 5, mockOnUpdate);
    });

    it('validates round number when setting', () => {
      const { result, mockOnUpdate } = setupRoundTrackingTest();
      performRoundAction(result, 'setRound', -1);
      assertRoundState(result, 2); // Unchanged
      assertError(result, 'Round must be at least 1');
      assertNoUpdate(mockOnUpdate);
    });

    it('clears error after successful round change', () => {
      const { result } = setupRoundTrackingTest();
      performRoundAction(result, 'setRound', -1);
      assertError(result, 'Round must be at least 1');
      performRoundAction(result, 'nextRound');
      assertNoError(result);
    });
  });
});