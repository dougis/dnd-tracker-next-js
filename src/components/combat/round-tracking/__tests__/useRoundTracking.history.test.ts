import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  performRoundAction,
} from './round-tracking-test-helpers';

describe('useRoundTracking - History Management', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
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
});