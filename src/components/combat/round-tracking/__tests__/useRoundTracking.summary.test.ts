import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';
import {
  setupRoundTrackingTest,
  performRoundAction,
  createMockEncounterWithStartTime,
} from './round-tracking-test-helpers';

describe('useRoundTracking - Session Summary', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
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
});