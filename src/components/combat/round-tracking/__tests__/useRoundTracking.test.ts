import { renderHook, act } from '@testing-library/react';
import { useRoundTracking } from '../useRoundTracking';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('useRoundTracking', () => {
  let mockEncounter: IEncounter;
  let mockOnUpdate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
    mockOnUpdate = jest.fn();
  });

  describe('Round Management', () => {
    it('initializes with current round from encounter', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      expect(result.current.currentRound).toBe(2);
    });

    it('advances to next round', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.currentRound).toBe(3);
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        currentRound: 3,
      }));
    });

    it('goes to previous round', () => {
      mockEncounter.combatState.currentRound = 3;
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.previousRound();
      });

      expect(result.current.currentRound).toBe(2);
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        currentRound: 2,
      }));
    });

    it('does not go below round 1', () => {
      mockEncounter.combatState.currentRound = 1;
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.previousRound();
      });

      expect(result.current.currentRound).toBe(1);
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('sets specific round number', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.setRound(5);
      });

      expect(result.current.currentRound).toBe(5);
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        currentRound: 5,
      }));
    });

    it('validates round number when setting', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.setRound(-1);
      });

      expect(result.current.currentRound).toBe(2); // Unchanged
      expect(result.current.error).toBe('Round must be at least 1');
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('clears error after successful round change', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.setRound(-1);
      });

      expect(result.current.error).toBe('Round must be at least 1');

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Duration Tracking', () => {
    it('calculates round duration', () => {
      mockEncounter.combatState.startedAt = new Date(Date.now() - 300000); // 5 minutes ago
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      expect(result.current.duration.totalSeconds).toBe(300);
      expect(result.current.duration.averageRoundDuration).toBe(150); // 300s / 2 rounds
    });

    it('estimates remaining time with max rounds', () => {
      mockEncounter.combatState.startedAt = new Date(Date.now() - 300000);
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, { maxRounds: 5 }));

      expect(result.current.duration.estimatedRemainingTime).toBe(450); // 3 rounds * 150s/round
    });

    it('handles undefined start time', () => {
      mockEncounter.combatState.startedAt = undefined;
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      expect(result.current.duration.totalSeconds).toBe(0);
      expect(result.current.duration.averageRoundDuration).toBe(0);
    });

    it('formats duration as human readable', () => {
      mockEncounter.combatState.startedAt = new Date(Date.now() - 3900000); // 65 minutes ago
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      expect(result.current.duration.formatted).toBe('1h 5m');
    });
  });

  describe('Effect Management', () => {
    const mockEffects = [
      {
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 3,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      },
      {
        id: 'effect2',
        name: 'Bless',
        participantId: PARTICIPANT_IDS.SECOND,
        duration: 10,
        startRound: 2,
        description: '+1d4 to attacks and saves',
      },
    ];

    it('adds new effect', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addEffect({
          name: 'Haste',
          participantId: PARTICIPANT_IDS.FIRST,
          duration: 10,
          description: 'Double speed',
        });
      });

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].name).toBe('Haste');
      expect(result.current.effects[0].startRound).toBe(2); // Current round
    });

    it('removes effect by id', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialEffects: mockEffects
      }));

      act(() => {
        result.current.removeEffect('effect1');
      });

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].id).toBe('effect2');
    });

    it('calculates remaining duration for effects', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialEffects: mockEffects
      }));

      const poisonEffect = result.current.effects.find(e => e.id === 'effect1');
      expect(result.current.getEffectRemainingDuration(poisonEffect!)).toBe(2); // 3 - (2-1)

      const blessEffect = result.current.effects.find(e => e.id === 'effect2');
      expect(result.current.getEffectRemainingDuration(blessEffect!)).toBe(10); // 10 - (2-2)
    });

    it('identifies expiring effects', () => {
      const expiringEffects = [
        {
          id: 'effect1',
          name: 'Poison',
          participantId: PARTICIPANT_IDS.FIRST,
          duration: 2,
          startRound: 1,
          description: 'Takes 1d6 poison damage',
        },
      ];

      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialEffects: expiringEffects
      }));

      expect(result.current.getExpiringEffects()).toHaveLength(1);
      expect(result.current.getExpiringEffects()[0].id).toBe('effect1');
    });

    it('automatically removes expired effects on round change', () => {
      const expiredEffects = [
        {
          id: 'effect1',
          name: 'Poison',
          participantId: PARTICIPANT_IDS.FIRST,
          duration: 1,
          startRound: 1,
          description: 'Takes 1d6 poison damage',
        },
      ];

      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialEffects: expiredEffects
      }));

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.effects).toHaveLength(0);
    });

    it('calls onEffectExpiry callback when effects expire', () => {
      const onEffectExpiry = jest.fn();
      const expiredEffects = [
        {
          id: 'effect1',
          name: 'Poison',
          participantId: PARTICIPANT_IDS.FIRST,
          duration: 1,
          startRound: 1,
          description: 'Takes 1d6 poison damage',
        },
      ];

      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialEffects: expiredEffects,
        onEffectExpiry
      }));

      act(() => {
        result.current.nextRound();
      });

      expect(onEffectExpiry).toHaveBeenCalledWith(['effect1']);
    });
  });

  describe('Trigger Management', () => {
    const mockTriggers = [
      {
        id: 'trigger1',
        name: 'Lair Action',
        triggerRound: 3,
        description: 'The dragon uses its lair action',
        isActive: true,
      },
      {
        id: 'trigger2',
        name: 'Reinforcements',
        triggerRound: 5,
        description: 'Orc reinforcements arrive',
        isActive: true,
      },
    ];

    it('adds new trigger', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addTrigger({
          name: 'Trap Activation',
          triggerRound: 4,
          description: 'The floor collapses',
        });
      });

      expect(result.current.triggers).toHaveLength(1);
      expect(result.current.triggers[0].name).toBe('Trap Activation');
    });

    it('activates trigger', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialTriggers: mockTriggers
      }));

      act(() => {
        result.current.activateTrigger('trigger1');
      });

      const trigger = result.current.triggers.find(t => t.id === 'trigger1');
      expect(trigger?.isActive).toBe(false);
      expect(trigger?.triggeredRound).toBe(2);
    });

    it('identifies due triggers', () => {
      mockEncounter.combatState.currentRound = 3;
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialTriggers: mockTriggers
      }));

      const dueTriggers = result.current.getDueTriggers();
      expect(dueTriggers).toHaveLength(1);
      expect(dueTriggers[0].id).toBe('trigger1');
    });

    it('gets upcoming triggers', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialTriggers: mockTriggers
      }));

      const upcomingTriggers = result.current.getUpcomingTriggers();
      expect(upcomingTriggers).toHaveLength(2);
      expect(upcomingTriggers[0].triggerRound).toBeLessThanOrEqual(upcomingTriggers[1].triggerRound);
    });

    it('calls onTriggerActivation callback', () => {
      const onTriggerActivation = jest.fn();
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        initialTriggers: mockTriggers,
        onTriggerActivation
      }));

      act(() => {
        result.current.activateTrigger('trigger1');
      });

      expect(onTriggerActivation).toHaveBeenCalledWith('trigger1', mockTriggers[0]);
    });
  });

  describe('History Management', () => {
    it('records round changes in history', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].round).toBe(3);
      expect(result.current.history[0].events).toContain('Round started');
    });

    it('adds custom events to history', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addHistoryEvent('Wizard casts Fireball');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].round).toBe(2);
      expect(result.current.history[0].events).toContain('Wizard casts Fireball');
    });

    it('groups events by round', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addHistoryEvent('First event');
        result.current.addHistoryEvent('Second event');
        result.current.nextRound();
        result.current.addHistoryEvent('Third event');
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].round).toBe(2);
      expect(result.current.history[0].events).toHaveLength(2);
      expect(result.current.history[1].round).toBe(3);
      expect(result.current.history[1].events).toHaveLength(2); // 'Third event' + 'Round started'
    });

    it('clears history when requested', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addHistoryEvent('Test event');
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('Session Summary', () => {
    it('calculates session statistics', () => {
      mockEncounter.combatState.startedAt = new Date(Date.now() - 600000); // 10 minutes ago
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addHistoryEvent('Attack action');
        result.current.addHistoryEvent('Spell cast');
        result.current.nextRound();
        result.current.addHistoryEvent('Healing potion');
      });

      const summary = result.current.getSessionSummary();
      expect(summary.totalRounds).toBe(3);
      expect(summary.totalDuration).toBe(600);
      expect(summary.totalActions).toBe(3); // Custom events count as actions
    });

    it('exports round data', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.addHistoryEvent('Test event');
        result.current.addEffect({
          name: 'Test Effect',
          participantId: PARTICIPANT_IDS.FIRST,
          duration: 5,
          description: 'Test description',
        });
      });

      const exportData = result.current.exportRoundData();

      expect(exportData.currentRound).toBe(2);
      expect(exportData.history).toHaveLength(1);
      expect(exportData.effects).toHaveLength(1);
      expect(exportData.encounter.name).toBe('Test Encounter');
    });
  });

  describe('Performance and Memory', () => {
    it('debounces rapid round changes', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      act(() => {
        result.current.nextRound();
        result.current.nextRound();
        result.current.nextRound();
      });

      // Should only call update once after debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnUpdate).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('limits history size to prevent memory issues', () => {
      const { result } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate, {
        maxHistoryRounds: 2
      }));

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.nextRound();
        }
      });

      expect(result.current.history).toHaveLength(2);
    });

    it('cleans up timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const { unmount } = renderHook(() => useRoundTracking(mockEncounter, mockOnUpdate));

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid encounter', () => {
      const { result } = renderHook(() => useRoundTracking(null as any, mockOnUpdate));

      expect(result.current.currentRound).toBe(1);
      expect(result.current.error).toBe('Invalid encounter data');
    });

    it('handles missing combat state', () => {
      const invalidEncounter = { ...mockEncounter, combatState: null };
      const { result } = renderHook(() => useRoundTracking(invalidEncounter as any, mockOnUpdate));

      expect(result.current.currentRound).toBe(1);
      expect(result.current.error).toBe('Invalid combat state');
    });

    it('handles update callback errors gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Update failed');
      });

      const { result } = renderHook(() => useRoundTracking(mockEncounter, errorCallback));

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.error).toBe('Failed to update encounter');
    });
  });
});