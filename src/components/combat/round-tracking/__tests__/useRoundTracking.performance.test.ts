import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  performRoundAction,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Performance and Memory', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
  });

  describe('Performance and Memory', () => {
    it('debounces rapid round changes', () => {
      jest.useFakeTimers();
      const { result, mockOnUpdate } = setupRoundTrackingTest(undefined, undefined, { enableDebouncing: true });

      performRoundAction(result, 'nextRound');
      performRoundAction(result, 'nextRound');
      performRoundAction(result, 'nextRound');

      jest.advanceTimersByTime(300);

      expect(mockOnUpdate).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('limits history size to prevent memory issues', () => {
      const { result } = setupRoundTrackingTest(undefined, undefined, { maxHistoryRounds: 2 });

      for (let i = 0; i < 5; i++) {
        performRoundAction(result, 'nextRound');
      }

      expect(result.current.history).toHaveLength(2);
    });

    it('cleans up timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const { unmount } = setupRoundTrackingTest();

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});