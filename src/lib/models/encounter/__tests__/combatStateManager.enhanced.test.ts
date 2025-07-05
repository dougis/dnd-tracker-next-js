import {
  enhancedStartCombat,
  enhancedEndCombat,
  enhancedNextTurn,
  getCombatHistory,
  clearCombatHistory,
  saveCombatState,
  loadCombatState,
} from '../combatStateManager';
import { IEncounter } from '../interfaces';
import { createMockEncounter, setupActiveEncounter } from './combatStateManager.test-utils';

describe('Combat State Manager - Enhanced Functions', () => {
  let encounter: IEncounter;

  beforeEach(() => {
    encounter = createMockEncounter();
    clearCombatHistory(encounter._id.toString());
  });

  describe('enhancedStartCombat', () => {
    it('should clear previous history and log combat start', () => {
      // Add some existing history first
      getCombatHistory(encounter._id.toString());

      enhancedStartCombat(encounter, true);

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('combat_started');
      expect(history[0].details?.autoRollInitiative).toBe(true);
      expect(history[0].details?.participantCount).toBe(encounter.participants.length);
    });

    it('should handle default parameters', () => {
      enhancedStartCombat(encounter);

      const history = getCombatHistory(encounter._id.toString());
      expect(history[0].details?.autoRollInitiative).toBe(false);
    });
  });

  describe('enhancedEndCombat', () => {
    it('should log combat end with details', () => {
      encounter.combatState.currentRound = 5;
      encounter.combatState.currentTurn = 2;
      encounter.combatState.totalDuration = 3600;

      enhancedEndCombat(encounter);

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('combat_ended');
      expect(history[0].details?.totalRounds).toBe(5);
      expect(history[0].details?.totalDuration).toBe(3600);
    });

    it('should clear saved state after combat ends', () => {
      saveCombatState(encounter);
      
      enhancedEndCombat(encounter);

      clearCombatHistory(encounter._id.toString());
      const result = loadCombatState(encounter);
      expect(result).toBe(false);
    });
  });

  describe('enhancedNextTurn', () => {
    beforeEach(() => {
      setupActiveEncounter(encounter);
    });

    it('should log turn end for current participant', () => {
      enhancedNextTurn(encounter);

      const history = getCombatHistory(encounter._id.toString());
      const turnEndLog = history.find(h => h.action === 'turn_end');
      expect(turnEndLog).toBeDefined();
      expect(turnEndLog?.participantId?.toString()).toBe('507f1f77bcf86cd799439011');
      expect(turnEndLog?.round).toBe(2);
      expect(turnEndLog?.turn).toBe(0);
    });

    it('should log turn start for next participant', () => {
      enhancedNextTurn(encounter);

      const history = getCombatHistory(encounter._id.toString());
      const turnStartLog = history.find(h => h.action === 'turn_start');
      expect(turnStartLog).toBeDefined();
      expect(turnStartLog?.participantId?.toString()).toBe('507f1f77bcf86cd799439012');
      expect(turnStartLog?.round).toBe(2);
      expect(turnStartLog?.turn).toBe(1);
    });

    it('should log round transitions when advancing to new round', () => {
      encounter.combatState.currentTurn = 1;

      enhancedNextTurn(encounter);

      const history = getCombatHistory(encounter._id.toString());
      const roundEndLog = history.find(h => h.action === 'round_end');
      const roundStartLog = history.find(h => h.action === 'round_start');
      
      expect(roundEndLog).toBeDefined();
      expect(roundEndLog?.round).toBe(2);
      expect(roundEndLog?.turn).toBe(1);
      
      expect(roundStartLog).toBeDefined();
      expect(roundStartLog?.round).toBe(3);
      expect(roundStartLog?.turn).toBe(0);
    });

    it('should handle empty initiative order gracefully', () => {
      encounter.combatState.initiativeOrder = [];

      const result = enhancedNextTurn(encounter);
      expect(result).toBe(true);

      const history = getCombatHistory(encounter._id.toString());
      expect(history.filter(h => h.action === 'turn_start' || h.action === 'turn_end')).toHaveLength(0);
    });

    it('should return true on successful execution', () => {
      const result = enhancedNextTurn(encounter);
      expect(result).toBe(true);
    });
  });
});