import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  createMockEncounterWithStartTime,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Duration Tracking', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
  });

  describe('Duration Tracking', () => {
    it('calculates round duration', () => {
      const encounter = createMockEncounterWithStartTime(5);
      const { result } = setupRoundTrackingTest(encounter);

      expect(result.current.duration.totalSeconds).toBe(300);
      expect(result.current.duration.averageRoundDuration).toBe(150); // 300s / 2 rounds
    });

    it('estimates remaining time with max rounds', () => {
      const encounter = createMockEncounterWithStartTime(5);
      const { result } = setupRoundTrackingTest(encounter, undefined, { maxRounds: 5 });

      expect(result.current.duration.estimatedRemainingTime).toBe(450); // 3 rounds * 150s/round
    });

    it('handles undefined start time', () => {
      const encounter = createTestEncounter();
      makeEncounterActive(encounter);
      encounter.combatState.startedAt = undefined;
      const { result } = setupRoundTrackingTest(encounter);

      expect(result.current.duration.totalSeconds).toBe(0);
      expect(result.current.duration.averageRoundDuration).toBe(0);
    });

    it('formats duration as human readable', () => {
      const encounter = createMockEncounterWithStartTime(65);
      const { result } = setupRoundTrackingTest(encounter);

      expect(result.current.duration.formatted).toBe('1h 5m');
    });
  });
});