import { Types } from 'mongoose';
import {
  pauseCombat,
  resumeCombat,
  logCombatAction,
  getCombatHistory,
  clearCombatHistory,
  getCombatPhase,
} from '../combatStateManager';
import { IEncounter } from '../interfaces';
import { createMockEncounter } from './combatStateManager.test-utils';

describe('Combat State Manager - Basic Operations', () => {
  let encounter: IEncounter;

  beforeEach(() => {
    encounter = createMockEncounter();
    clearCombatHistory(encounter._id.toString());
  });

  describe('pauseCombat', () => {
    it('should pause active combat', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.startedAt = new Date();

      const result = pauseCombat(encounter);

      expect(result).toBe(true);
      expect(encounter.combatState.pausedAt).toBeDefined();
      expect(encounter.combatState.isActive).toBe(false);
    });

    it('should return false if combat is not active', () => {
      encounter.combatState.isActive = false;

      const result = pauseCombat(encounter);

      expect(result).toBe(false);
      expect(encounter.combatState.pausedAt).toBeUndefined();
    });

    it('should log pause action to combat history', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 2;

      pauseCombat(encounter);

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('combat_paused');
      expect(history[0].round).toBe(2);
    });
  });

  describe('resumeCombat', () => {
    it('should resume paused combat', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = new Date();
      encounter.status = 'active';

      const result = resumeCombat(encounter);

      expect(result).toBe(true);
      expect(encounter.combatState.isActive).toBe(true);
      expect(encounter.combatState.pausedAt).toBeUndefined();
      expect(encounter.status).toBe('active');
    });

    it('should return false if combat was not paused', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.pausedAt = undefined;

      const result = resumeCombat(encounter);

      expect(result).toBe(false);
    });

    it('should log resume action to combat history', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = new Date();
      encounter.combatState.currentRound = 3;
      encounter.status = 'active';

      resumeCombat(encounter);

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('combat_resumed');
      expect(history[0].round).toBe(3);
    });
  });

  describe('logCombatAction', () => {
    it('should log combat action with correct details', () => {
      encounter.combatState.currentRound = 2;
      encounter.combatState.currentTurn = 1;
      const participantId = new Types.ObjectId();

      logCombatAction(encounter._id.toString(), {
        action: 'damage_dealt',
        participantId,
        details: { damage: 15, target: 'Goblin' },
        round: encounter.combatState.currentRound,
        turn: encounter.combatState.currentTurn,
      });

      const history = getCombatHistory(encounter._id.toString());
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe('damage_dealt');
      expect(history[0].participantId).toEqual(participantId);
      expect(history[0].details).toEqual({ damage: 15, target: 'Goblin' });
      expect(history[0].round).toBe(2);
      expect(history[0].turn).toBe(1);
      expect(history[0].timestamp).toBeDefined();
    });

    it('should maintain chronological order of actions', (done) => {
      const encounterId = encounter._id.toString();

      logCombatAction(encounterId, {
        action: 'turn_start',
        round: 1,
        turn: 0,
      });

      setTimeout(() => {
        logCombatAction(encounterId, {
          action: 'damage_dealt',
          round: 1,
          turn: 0,
        });

        const history = getCombatHistory(encounterId);
        expect(history).toHaveLength(2);
        expect(history[0].timestamp.getTime()).toBeLessThanOrEqual(
          history[1].timestamp.getTime()
        );
        done();
      }, 10);
    });
  });

  describe('getCombatHistory', () => {
    it('should return empty array for encounter with no history', () => {
      const history = getCombatHistory(encounter._id.toString());
      expect(history).toEqual([]);
    });

    it('should return complete combat history', () => {
      const encounterId = encounter._id.toString();

      logCombatAction(encounterId, { action: 'combat_started', round: 1, turn: 0 });
      logCombatAction(encounterId, { action: 'turn_start', round: 1, turn: 0 });
      logCombatAction(encounterId, { action: 'damage_dealt', round: 1, turn: 0 });

      const history = getCombatHistory(encounterId);
      expect(history).toHaveLength(3);
      expect(history.map(h => h.action)).toEqual([
        'combat_started',
        'turn_start',
        'damage_dealt',
      ]);
    });
  });

  describe('clearCombatHistory', () => {
    it('should clear all combat history for encounter', () => {
      const encounterId = encounter._id.toString();

      logCombatAction(encounterId, { action: 'combat_started', round: 1, turn: 0 });
      logCombatAction(encounterId, { action: 'turn_start', round: 1, turn: 0 });

      expect(getCombatHistory(encounterId)).toHaveLength(2);

      clearCombatHistory(encounterId);
      expect(getCombatHistory(encounterId)).toHaveLength(0);
    });
  });

  describe('getCombatPhase', () => {
    it('should return "inactive" for inactive combat', () => {
      encounter.combatState.isActive = false;

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('inactive');
    });

    it('should return "paused" for paused combat', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = new Date();
      encounter.status = 'active';

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('paused');
    });

    it('should return "active" for active combat', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.pausedAt = undefined;

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('active');
    });

    it('should return "ended" for completed combat', () => {
      encounter.combatState.isActive = false;
      encounter.combatState.endedAt = new Date();
      encounter.status = 'completed';

      const phase = getCombatPhase(encounter);
      expect(phase).toBe('ended');
    });

    it('should return correct phase for various encounter states', () => {
      // Test inactive phase
      encounter.combatState.isActive = false;
      encounter.combatState.pausedAt = undefined;
      encounter.combatState.endedAt = undefined;
      expect(getCombatPhase(encounter)).toBe('inactive');

      // Test active phase
      encounter.combatState.isActive = true;
      expect(getCombatPhase(encounter)).toBe('active');

      // Test ended phase with endedAt
      encounter.combatState.isActive = false;
      encounter.combatState.endedAt = new Date();
      expect(getCombatPhase(encounter)).toBe('ended');

      // Test ended phase with completed status
      encounter.combatState.endedAt = undefined;
      encounter.status = 'completed';
      expect(getCombatPhase(encounter)).toBe('ended');
    });
  });
});