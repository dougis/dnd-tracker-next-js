import { renderHook, act } from '@testing-library/react';
import { useCombatTimer } from '../useCombatTimer';

interface TestTimerProps {
  startedAtOffset?: number;
  pausedAtOffset?: number;
  isActive?: boolean;
  roundTimeLimit?: number;
}

const createTestTimer = (props: TestTimerProps = {}) => {
  const {
    startedAtOffset = 0,
    pausedAtOffset,
    isActive = true,
    roundTimeLimit
  } = props;

  const startedAt = startedAtOffset ? new Date(Date.now() - startedAtOffset) : undefined;
  const pausedAt = pausedAtOffset ? new Date(Date.now() - pausedAtOffset) : undefined;

  return renderHook(() =>
    useCombatTimer({
      startedAt,
      pausedAt,
      isActive,
      roundTimeLimit,
    })
  );
};

// Helper function to test round timer warning states
const expectRoundTimerState = (
  result: any,
  expectedRemaining: number,
  expectedWarning: boolean,
  expectedCritical: boolean,
  expectedExpired: boolean = false
) => {
  expect(result.current.roundTimeRemaining).toBe(expectedRemaining);
  expect(result.current.isRoundWarning).toBe(expectedWarning);
  expect(result.current.isRoundCritical).toBe(expectedCritical);
  expect(result.current.isRoundExpired).toBe(expectedExpired);
};

describe('useCombatTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Combat Duration Timer', () => {
    it('tracks combat duration correctly', () => {
      const { result } = createTestTimer({ startedAtOffset: 120000 }); // 2 minutes ago

      expect(result.current.combatDuration).toBe(120000); // 2 minutes in milliseconds
      expect(result.current.formattedDuration).toBe('2:00');
    });

    it('pauses timer when combat is paused', () => {
      const { result } = createTestTimer({
        startedAtOffset: 120000,
        pausedAtOffset: 60000 // Paused 1 minute ago
      });

      expect(result.current.combatDuration).toBe(60000); // Only 1 minute elapsed
      expect(result.current.formattedDuration).toBe('1:00');
      expect(result.current.isPaused).toBe(true);
    });

    it('updates timer in real-time', () => {
      const { result } = createTestTimer({ startedAtOffset: 60000 });

      expect(result.current.formattedDuration).toBe('1:00');

      // Fast-forward 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.formattedDuration).toBe('1:30');
    });

    it('stops timer when combat is not active', () => {
      const { result } = createTestTimer({
        startedAtOffset: 120000,
        isActive: false
      });

      expect(result.current.combatDuration).toBe(0);
      expect(result.current.formattedDuration).toBe('0:00');
    });

    it('formats duration correctly for different time spans', () => {
      const testCases = [
        { milliseconds: 5000, expected: '0:05' },
        { milliseconds: 30000, expected: '0:30' },
        { milliseconds: 60000, expected: '1:00' },
        { milliseconds: 90000, expected: '1:30' },
        { milliseconds: 3600000, expected: '60:00' },
        { milliseconds: 3665000, expected: '61:05' },
      ];

      testCases.forEach(({ milliseconds, expected }) => {
        const { result } = createTestTimer({ startedAtOffset: milliseconds });
        expect(result.current.formattedDuration).toBe(expected);
      });
    });
  });

  describe('Round Timer', () => {
    it('tracks round timer countdown', () => {
      const { result } = createTestTimer({
        startedAtOffset: 30000, // 30 seconds ago
        roundTimeLimit: 60000 // 1 minute limit
      });

      expect(result.current.roundTimeRemaining).toBe(30000); // 30 seconds remaining
      expect(result.current.formattedRoundTime).toBe('0:30');
    });

    it('shows round timer at warning threshold', () => {
      const { result } = createTestTimer({
        startedAtOffset: 46000, // 46 seconds ago
        roundTimeLimit: 60000 // 1 minute limit
      });

      expect(result.current.roundTimeRemaining).toBe(14000); // 14 seconds remaining
      expect(result.current.isRoundWarning).toBe(true);
      expect(result.current.isRoundCritical).toBe(false);
    });

    it('shows round timer at critical threshold', () => {
      const { result } = createTestTimer({
        startedAtOffset: 56000, // 56 seconds ago
        roundTimeLimit: 60000 // 1 minute limit
      });

      expect(result.current.roundTimeRemaining).toBe(4000); // 4 seconds remaining
      expect(result.current.isRoundWarning).toBe(false);
      expect(result.current.isRoundCritical).toBe(true);
    });

    it('shows round timer expired when time is up', () => {
      const { result } = createTestTimer({
        startedAtOffset: 70000, // 70 seconds ago
        roundTimeLimit: 60000 // 1 minute limit
      });

      expect(result.current.roundTimeRemaining).toBe(0);
      expect(result.current.isRoundExpired).toBe(true);
      expect(result.current.formattedRoundTime).toBe('0:00');
    });

    it('does not show round timer when not configured', () => {
      const { result } = createTestTimer({ startedAtOffset: 30000 });

      expect(result.current.hasRoundTimer).toBe(false);
      expect(result.current.roundTimeRemaining).toBe(0);
      expect(result.current.formattedRoundTime).toBe('');
    });

    it('pauses round timer when combat is paused', () => {
      const { result } = createTestTimer({
        startedAtOffset: 30000,
        pausedAtOffset: 10000, // Paused 10 seconds ago
        roundTimeLimit: 60000
      });

      expect(result.current.roundTimeRemaining).toBe(40000); // 40 seconds remaining (20 seconds elapsed)
      expect(result.current.formattedRoundTime).toBe('0:40');
    });

    it('resets round timer on new round', () => {
      const { result, rerender } = renderHook(
        (props) => useCombatTimer(props),
        {
          initialProps: {
            startedAt: new Date(Date.now() - 30000),
            pausedAt: undefined,
            isActive: true,
            roundTimeLimit: 60000,
          },
        }
      );

      expect(result.current.roundTimeRemaining).toBe(30000);

      // Simulate new round (reset timer)
      rerender({
        startedAt: new Date(), // New round starts now
        pausedAt: undefined,
        isActive: true,
        roundTimeLimit: 60000,
      });

      expect(result.current.roundTimeRemaining).toBe(60000);
    });
  });

  describe('Timer Controls', () => {
    it('provides pause functionality', () => {
      const startTime = new Date(Date.now() - 60000);
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('provides resume functionality', () => {
      const startTime = new Date(Date.now() - 60000);
      const pausedTime = new Date(Date.now() - 30000);

      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: pausedTime,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resume();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('provides reset functionality', () => {
      const startTime = new Date(Date.now() - 60000);
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(60000);

      act(() => {
        result.current.reset();
      });

      expect(result.current.combatDuration).toBe(0);
    });
  });

  describe('Fixed Threshold Warning System (15s/5s)', () => {
    it('shows warning state when exactly 15 seconds remaining', () => {
      const { result } = createTestTimer({
        startedAtOffset: 45000, // 45 seconds ago
        roundTimeLimit: 60000 // 1 minute limit, 15 seconds remaining
      });

      expectRoundTimerState(result, 15000, true, false, false);
    });

    it('shows warning state when 10 seconds remaining (between 15s and 5s)', () => {
      const { result } = createTestTimer({
        startedAtOffset: 50000, // 50 seconds ago
        roundTimeLimit: 60000 // 1 minute limit, 10 seconds remaining
      });

      expectRoundTimerState(result, 10000, true, false, false);
    });

    it('shows critical state when exactly 5 seconds remaining', () => {
      const { result } = createTestTimer({
        startedAtOffset: 55000, // 55 seconds ago
        roundTimeLimit: 60000 // 1 minute limit, 5 seconds remaining
      });

      expectRoundTimerState(result, 5000, false, true, false);
    });

    it('shows critical state when 3 seconds remaining (less than 5s)', () => {
      const { result } = createTestTimer({
        startedAtOffset: 57000, // 57 seconds ago
        roundTimeLimit: 60000 // 1 minute limit, 3 seconds remaining
      });

      expectRoundTimerState(result, 3000, false, true, false);
    });

    it('shows no warning when more than 15 seconds remaining', () => {
      const { result } = createTestTimer({
        startedAtOffset: 40000, // 40 seconds ago
        roundTimeLimit: 60000 // 1 minute limit, 20 seconds remaining
      });

      expectRoundTimerState(result, 20000, false, false, false);
    });

    it('works correctly with different round time limits', () => {
      // Test with 2 minute limit
      const { result: result120 } = createTestTimer({
        startedAtOffset: 105000, // 105 seconds ago
        roundTimeLimit: 120000 // 2 minute limit, 15 seconds remaining
      });

      expectRoundTimerState(result120, 15000, true, false);

      // Test with 30 second limit
      const { result: result30 } = createTestTimer({
        startedAtOffset: 15000, // 15 seconds ago
        roundTimeLimit: 30000 // 30 second limit, 15 seconds remaining
      });

      expectRoundTimerState(result30, 15000, true, false);
    });
  });

  describe('Timer Events', () => {
    it('triggers callback on round timer warning', () => {
      const onWarning = jest.fn();
      const startTime = new Date(Date.now() - 46000); // 46 seconds ago

      renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000,
          onRoundWarning: onWarning,
        })
      );

      expect(onWarning).toHaveBeenCalledTimes(1);
    });

    it('triggers callback on round timer critical', () => {
      const onCritical = jest.fn();
      const startTime = new Date(Date.now() - 56000); // 56 seconds ago

      renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000,
          onRoundCritical: onCritical,
        })
      );

      expect(onCritical).toHaveBeenCalledTimes(1);
    });

    it('triggers callback on round timer expired', () => {
      const onExpired = jest.fn();
      const startTime = new Date(Date.now() - 70000); // 70 seconds ago

      renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000,
          onRoundExpired: onExpired,
        })
      );

      expect(onExpired).toHaveBeenCalledTimes(1);
    });

    it('does not trigger callbacks when paused', () => {
      const onWarning = jest.fn();
      const startTime = new Date(Date.now() - 46000);
      const pausedTime = new Date(Date.now() - 5000);

      renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: pausedTime,
          isActive: true,
          roundTimeLimit: 60000,
          onRoundWarning: onWarning,
        })
      );

      expect(onWarning).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined start time', () => {
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: undefined,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(0);
      expect(result.current.formattedDuration).toBe('0:00');
    });

    it('handles negative time calculations', () => {
      const futureTime = new Date(Date.now() + 60000); // 1 minute in future
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: futureTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(0);
      expect(result.current.formattedDuration).toBe('0:00');
    });

    it('handles very large time values', () => {
      const longAgo = new Date(Date.now() - 86400000); // 24 hours ago
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: longAgo,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(86400000);
      expect(result.current.formattedDuration).toBe('1440:00');
    });

    it('handles paused time after start time', () => {
      const startTime = new Date(Date.now() - 60000);
      const pausedTime = new Date(Date.now() - 30000);

      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: pausedTime,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(30000);
      expect(result.current.formattedDuration).toBe('0:30');
    });
  });

  describe('Cleanup', () => {
    it('cleans up timer on unmount', () => {
      const { unmount } = renderHook(() =>
        useCombatTimer({
          startedAt: new Date(),
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('cleans up event listeners', () => {
      const onWarning = jest.fn();
      const { unmount } = renderHook(() =>
        useCombatTimer({
          startedAt: new Date(Date.now() - 46000),
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000,
          onRoundWarning: onWarning,
        })
      );

      unmount();

      // Fast-forward time after unmount
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Should not trigger additional callbacks
      expect(onWarning).toHaveBeenCalledTimes(1);
    });
  });
});