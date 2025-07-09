import { renderHook, act } from '@testing-library/react';
import { useRoundTracking } from '../useRoundTracking';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  performRoundAction,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Error Handling', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
  });

  describe('Error Handling', () => {
    it('handles invalid encounter', () => {
      const { result } = renderHook(() => useRoundTracking(null as any, jest.fn()));

      expect(result.current.currentRound).toBe(1);
      expect(result.current.error).toBe('Invalid encounter data');
    });

    it('handles missing combat state', () => {
      const invalidEncounter = { ...mockEncounter, combatState: null };
      const { result } = renderHook(() => useRoundTracking(invalidEncounter as any, jest.fn()));

      expect(result.current.currentRound).toBe(1);
      expect(result.current.error).toBe('Invalid combat state');
    });

    it('handles update callback errors gracefully', () => {
      jest.useFakeTimers();
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Update failed');
      });

      const { result } = renderHook(() => useRoundTracking(mockEncounter, errorCallback, { enableDebouncing: true }));

      performRoundAction(result, 'nextRound');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.error).toBe('Failed to update encounter');

      jest.useRealTimers();
    });
  });
});