import { renderHook } from '@testing-library/react';
import { useRoundTracking } from '../useRoundTracking';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import { 
  setupRoundTrackingTest, 
  performRoundAction, 
  assertRoundState, 
  assertNoUpdate, 
  assertError, 
  assertNoError,
  createMockEncounterWithRound,
  createMockEncounterWithStartTime,
  createMockEffectsForTesting,
  createMockTriggersForTesting
} from './round-tracking-test-helpers';

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

  describe('Effect Management', () => {
    const createPoisonEffect = () => createMockEffectsForTesting([{
      id: 'effect1',
      name: 'Poison',
      participantId: PARTICIPANT_IDS.FIRST,
      duration: 3,
      startRound: 1,
      description: 'Takes 1d6 poison damage',
    }]);

    const createBlessEffect = () => createMockEffectsForTesting([{
      id: 'effect2',
      name: 'Bless',
      participantId: PARTICIPANT_IDS.SECOND,
      duration: 10,
      startRound: 2,
      description: '+1d4 to attacks and saves',
    }]);

    const createMultipleEffects = () => [...createPoisonEffect(), ...createBlessEffect()];

    it('adds new effect', () => {
      const { result } = setupRoundTrackingTest();
      const effectData = {
        name: 'Haste',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 10,
        description: 'Double speed',
      };

      performRoundAction(result, 'addEffect', effectData);

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].name).toBe('Haste');
      expect(result.current.effects[0].startRound).toBe(2);
    });

    it('removes effect by id', () => {
      const effects = createMultipleEffects();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: effects });

      performRoundAction(result, 'removeEffect', 'effect1');

      expect(result.current.effects).toHaveLength(1);
      expect(result.current.effects[0].id).toBe('effect2');
    });

    it('calculates remaining duration for effects', () => {
      const effects = createMultipleEffects();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: effects });

      const poisonEffect = result.current.effects.find(e => e.id === 'effect1');
      expect(result.current.getEffectRemainingDuration(poisonEffect!)).toBe(2);

      const blessEffect = result.current.effects.find(e => e.id === 'effect2');
      expect(result.current.getEffectRemainingDuration(blessEffect!)).toBe(10);
    });

    it('identifies expiring effects', () => {
      const expiringEffects = createMockEffectsForTesting([{
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 2,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      }]);

      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: expiringEffects });

      expect(result.current.getExpiringEffects()).toHaveLength(1);
      expect(result.current.getExpiringEffects()[0].id).toBe('effect1');
    });

    it('automatically removes expired effects on round change', () => {
      const expiredEffects = createMockEffectsForTesting([{
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 1,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      }]);

      const { result } = setupRoundTrackingTest(undefined, undefined, { initialEffects: expiredEffects });

      performRoundAction(result, 'nextRound');

      expect(result.current.effects).toHaveLength(0);
    });

    it('calls onEffectExpiry callback when effects expire', () => {
      const onEffectExpiry = jest.fn();
      const expiredEffects = createMockEffectsForTesting([{
        id: 'effect1',
        name: 'Poison',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 1,
        startRound: 1,
        description: 'Takes 1d6 poison damage',
      }]);

      const { result } = setupRoundTrackingTest(undefined, undefined, {
        initialEffects: expiredEffects,
        onEffectExpiry
      });

      performRoundAction(result, 'nextRound');

      expect(onEffectExpiry).toHaveBeenCalledWith(['effect1']);
    });
  });

  describe('Trigger Management', () => {
    const createLairTrigger = () => createMockTriggersForTesting([{
      id: 'trigger1',
      name: 'Lair Action',
      triggerRound: 3,
      description: 'The dragon uses its lair action',
      isActive: true,
    }]);

    const createReinforcementTrigger = () => createMockTriggersForTesting([{
      id: 'trigger2',
      name: 'Reinforcements',
      triggerRound: 5,
      description: 'Orc reinforcements arrive',
      isActive: true,
    }]);

    const createMultipleTriggers = () => [...createLairTrigger(), ...createReinforcementTrigger()];

    it('adds new trigger', () => {
      const { result } = setupRoundTrackingTest();
      const triggerData = {
        name: 'Trap Activation',
        triggerRound: 4,
        description: 'The floor collapses',
      };

      performRoundAction(result, 'addTrigger', triggerData);

      expect(result.current.triggers).toHaveLength(1);
      expect(result.current.triggers[0].name).toBe('Trap Activation');
    });

    it('activates trigger', () => {
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialTriggers: triggers });

      performRoundAction(result, 'activateTrigger', 'trigger1');

      const trigger = result.current.triggers.find(t => t.id === 'trigger1');
      expect(trigger?.isActive).toBe(false);
      expect(trigger?.triggeredRound).toBe(2);
    });

    it('identifies due triggers', () => {
      const encounter = createMockEncounterWithRound(3);
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(encounter, undefined, { initialTriggers: triggers });

      const dueTriggers = result.current.getDueTriggers();
      expect(dueTriggers).toHaveLength(1);
      expect(dueTriggers[0].id).toBe('trigger1');
    });

    it('gets upcoming triggers', () => {
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(undefined, undefined, { initialTriggers: triggers });

      const upcomingTriggers = result.current.getUpcomingTriggers();
      expect(upcomingTriggers).toHaveLength(2);
      expect(upcomingTriggers[0].triggerRound).toBeLessThanOrEqual(upcomingTriggers[1].triggerRound);
    });

    it('calls onTriggerActivation callback', () => {
      const onTriggerActivation = jest.fn();
      const triggers = createMultipleTriggers();
      const { result } = setupRoundTrackingTest(undefined, undefined, {
        initialTriggers: triggers,
        onTriggerActivation
      });

      performRoundAction(result, 'activateTrigger', 'trigger1');

      expect(onTriggerActivation).toHaveBeenCalledWith('trigger1', triggers[0]);
    });
  });

  describe('History Management', () => {
    it('records round changes in history', () => {
      const { result } = setupRoundTrackingTest();

      performRoundAction(result, 'nextRound');

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].round).toBe(3);
      expect(result.current.history[0].events).toContain('Round started');
    });

    it('adds custom events to history', () => {
      const { result } = setupRoundTrackingTest();

      performRoundAction(result, 'addHistoryEvent', 'Wizard casts Fireball');

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].round).toBe(2);
      expect(result.current.history[0].events).toContain('Wizard casts Fireball');
    });

    it('groups events by round', () => {
      const { result } = setupRoundTrackingTest();

      performRoundAction(result, 'addHistoryEvent', 'First event');
      performRoundAction(result, 'addHistoryEvent', 'Second event');
      performRoundAction(result, 'nextRound');
      performRoundAction(result, 'addHistoryEvent', 'Third event');

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].round).toBe(2);
      expect(result.current.history[0].events).toHaveLength(2);
      expect(result.current.history[1].round).toBe(3);
      expect(result.current.history[1].events).toHaveLength(2);
    });

    it('clears history when requested', () => {
      const { result } = setupRoundTrackingTest();

      performRoundAction(result, 'addHistoryEvent', 'Test event');
      performRoundAction(result, 'clearHistory');

      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('Session Summary', () => {
    it('calculates session statistics', () => {
      const encounter = createMockEncounterWithStartTime(10);
      const { result } = setupRoundTrackingTest(encounter);

      performRoundAction(result, 'addHistoryEvent', 'Attack action');
      performRoundAction(result, 'addHistoryEvent', 'Spell cast');
      performRoundAction(result, 'nextRound');
      performRoundAction(result, 'addHistoryEvent', 'Healing potion');

      const summary = result.current.getSessionSummary();
      expect(summary.totalRounds).toBe(3);
      expect(summary.totalDuration).toBe(600);
      expect(summary.totalActions).toBe(3);
    });

    it('exports round data', () => {
      const { result } = setupRoundTrackingTest();
      const effectData = {
        name: 'Test Effect',
        participantId: PARTICIPANT_IDS.FIRST,
        duration: 5,
        description: 'Test description',
      };

      performRoundAction(result, 'addHistoryEvent', 'Test event');
      performRoundAction(result, 'addEffect', effectData);

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

      jest.advanceTimersByTime(300);

      expect(result.current.error).toBe('Failed to update encounter');

      jest.useRealTimers();
    });
  });
});