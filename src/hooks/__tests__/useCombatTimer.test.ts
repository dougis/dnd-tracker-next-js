import { renderHook, act } from '@testing-library/react';
import { useCombatTimer } from '../useCombatTimer';

describe('useCombatTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Combat Duration Timer', () => {
    it('tracks combat duration correctly', () => {
      const startTime = new Date(Date.now() - 120000); // 2 minutes ago
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(120000); // 2 minutes in milliseconds
      expect(result.current.formattedDuration).toBe('2:00');
    });

    it('pauses timer when combat is paused', () => {
      const startTime = new Date(Date.now() - 120000);
      const pausedTime = new Date(Date.now() - 60000); // Paused 1 minute ago
      
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: pausedTime,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.combatDuration).toBe(60000); // Only 1 minute elapsed
      expect(result.current.formattedDuration).toBe('1:00');
      expect(result.current.isPaused).toBe(true);
    });

    it('updates timer in real-time', () => {
      const startTime = new Date(Date.now() - 60000);
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.formattedDuration).toBe('1:00');

      // Fast-forward 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.formattedDuration).toBe('1:30');
    });

    it('stops timer when combat is not active', () => {
      const startTime = new Date(Date.now() - 120000);
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: false,
          roundTimeLimit: undefined,
        })
      );

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
        const startTime = new Date(Date.now() - milliseconds);
        const { result } = renderHook(() =>
          useCombatTimer({
            startedAt: startTime,
            pausedAt: undefined,
            isActive: true,
            roundTimeLimit: undefined,
          })
        );

        expect(result.current.formattedDuration).toBe(expected);
      });
    });
  });

  describe('Round Timer', () => {
    it('tracks round timer countdown', () => {
      const startTime = new Date(Date.now() - 30000); // 30 seconds ago
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000, // 1 minute limit
        })
      );

      expect(result.current.roundTimeRemaining).toBe(30000); // 30 seconds remaining
      expect(result.current.formattedRoundTime).toBe('0:30');
    });

    it('shows round timer at warning threshold', () => {
      const startTime = new Date(Date.now() - 46000); // 46 seconds ago
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000, // 1 minute limit
        })
      );

      expect(result.current.roundTimeRemaining).toBe(14000); // 14 seconds remaining
      expect(result.current.isRoundWarning).toBe(true);
      expect(result.current.isRoundCritical).toBe(false);
    });

    it('shows round timer at critical threshold', () => {
      const startTime = new Date(Date.now() - 56000); // 56 seconds ago
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000, // 1 minute limit
        })
      );

      expect(result.current.roundTimeRemaining).toBe(4000); // 4 seconds remaining
      expect(result.current.isRoundWarning).toBe(false);
      expect(result.current.isRoundCritical).toBe(true);
    });

    it('shows round timer expired when time is up', () => {
      const startTime = new Date(Date.now() - 70000); // 70 seconds ago
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: 60000, // 1 minute limit
        })
      );

      expect(result.current.roundTimeRemaining).toBe(0);
      expect(result.current.isRoundExpired).toBe(true);
      expect(result.current.formattedRoundTime).toBe('0:00');
    });

    it('does not show round timer when not configured', () => {
      const startTime = new Date(Date.now() - 30000);
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: undefined,
          isActive: true,
          roundTimeLimit: undefined,
        })
      );

      expect(result.current.hasRoundTimer).toBe(false);
      expect(result.current.roundTimeRemaining).toBe(0);
      expect(result.current.formattedRoundTime).toBe('');
    });

    it('pauses round timer when combat is paused', () => {
      const startTime = new Date(Date.now() - 30000);
      const pausedTime = new Date(Date.now() - 10000); // Paused 10 seconds ago
      
      const { result } = renderHook(() =>
        useCombatTimer({
          startedAt: startTime,
          pausedAt: pausedTime,
          isActive: true,
          roundTimeLimit: 60000,
        })
      );

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