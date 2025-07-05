import { Types } from 'mongoose';
import { validateCombatState } from '../combatStateManager';
import { IEncounter } from '../interfaces';
import { createMockEncounter, createValidationTestParticipant } from './combatStateManager.test-utils';

describe('Combat State Manager - Validation', () => {
  let encounter: IEncounter;

  beforeEach(() => {
    encounter = createMockEncounter();
  });

  describe('validateCombatState', () => {
    it('should validate correct combat state', () => {
      const participant1Id = new Types.ObjectId('507f1f77bcf86cd799439011');
      const participant2Id = new Types.ObjectId('507f1f77bcf86cd799439012');

      encounter.combatState.isActive = true;
      encounter.combatState.currentRound = 2;
      encounter.combatState.currentTurn = 1;
      encounter.combatState.initiativeOrder = [
        {
          participantId: participant1Id,
          initiative: 15,
          dexterity: 14,
          isActive: false,
          hasActed: false,
        },
        {
          participantId: participant2Id,
          initiative: 12,
          dexterity: 10,
          isActive: true,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect invalid current turn index', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.currentTurn = 5;
      encounter.combatState.initiativeOrder = [
        {
          participantId: new Types.ObjectId(),
          initiative: 15,
          dexterity: 14,
          isActive: false,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current turn index is out of bounds');
    });

    it('should detect multiple active participants', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.initiativeOrder = [
        {
          participantId: new Types.ObjectId('507f1f77bcf86cd799439011'),
          initiative: 15,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        },
        {
          participantId: new Types.ObjectId('507f1f77bcf86cd799439012'),
          initiative: 12,
          dexterity: 10,
          isActive: true,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Multiple participants marked as active');
    });

    it('should detect negative round number', () => {
      encounter.combatState.currentRound = -1;

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current round cannot be negative');
    });

    it('should detect negative turn number', () => {
      encounter.combatState.currentTurn = -1;

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current turn cannot be negative');
    });

    it('should detect no active participant during active combat', () => {
      encounter.combatState.isActive = true;
      encounter.combatState.initiativeOrder = [
        {
          participantId: new Types.ObjectId('507f1f77bcf86cd799439011'),
          initiative: 15,
          dexterity: 14,
          isActive: false,
          hasActed: false,
        },
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No participant marked as active during active combat');
    });

    it('should detect negative initiative values', () => {
      encounter.combatState.initiativeOrder = [
        createValidationTestParticipant({ initiative: -5 }),
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Participant 507f1f77bcf86cd799439011 has negative initiative');
    });

    it('should detect negative dexterity values', () => {
      encounter.combatState.initiativeOrder = [
        createValidationTestParticipant({ dexterity: -2 }),
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Participant 507f1f77bcf86cd799439011 has negative dexterity');
    });

    it('should detect duplicate participants in initiative order', () => {
      const participantId = new Types.ObjectId('507f1f77bcf86cd799439011');
      encounter.combatState.initiativeOrder = [
        createValidationTestParticipant({ participantId }),
        createValidationTestParticipant({ participantId, initiative: 12, dexterity: 10 }),
      ];

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate participants found in initiative order');
    });

    it('should detect invalid timestamp combinations', () => {
      const now = new Date();
      const later = new Date(now.getTime() + 60000);

      encounter.combatState.startedAt = later;
      encounter.combatState.endedAt = now;

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start time cannot be after end time');
    });

    it('should detect invalid pause timestamp', () => {
      const now = new Date();
      const later = new Date(now.getTime() + 60000);

      encounter.combatState.startedAt = later;
      encounter.combatState.pausedAt = now;

      const result = validateCombatState(encounter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start time cannot be after pause time');
    });

    it('should validate edge case with empty combat state', () => {
      const emptyEncounter = {
        ...encounter,
        combatState: {
          isActive: false,
          currentRound: 0,
          currentTurn: 0,
          initiativeOrder: [],
          totalDuration: 0,
        },
      };

      const result = validateCombatState(emptyEncounter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});