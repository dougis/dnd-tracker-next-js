import { Types } from 'mongoose';
import {
  rollInitiativeWithModifier,
  rollBulkInitiative,
  generateInitiativeEntries,
  rerollInitiative,
  calculateInitiativeModifier,
  rollSingleInitiative,
  getInitiativeRollBreakdown,
  getDefaultInitiativePreferences,
  shouldAutoRoll,
  canReroll,
  IParticipantWithAbilityScores,
} from '../initiative-rolling';
import { IInitiativeEntry } from '../interfaces';
import {
  createBasicParticipantSet,
  createParticipantsWithInitiative,
  createFighterInitiativeEntry,
  createRogueInitiativeEntry,
  setupInitiativeRollingMock,
  setupSequentialMockRolls,
  resetInitiativeRollingMock,
  expectInitiativeEntryStructure,
  expectMultipleInitiativeStructures,
  expectAllInitiativeZero,
  expectInitiativeOrderSort,
  expectValidInitiativeOrder,
  rollInitiativeWithMockAndExpect,
  INITIATIVE_PARTICIPANT_IDS,
} from './initiative-test-helpers';

// Mock the rollInitiative function
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  rollInitiative: jest.fn(() => 10), // Mock d20 roll as 10
}));

describe('Initiative Rolling System', () => {
  let mockParticipants: IParticipantWithAbilityScores[];

  beforeEach(() => {
    resetInitiativeRollingMock();
    mockParticipants = createBasicParticipantSet();
  });

  describe('calculateInitiativeModifier', () => {
    it('should calculate dexterity modifier correctly', () => {
      expect(calculateInitiativeModifier(18)).toBe(4); // 18 dex = +4
      expect(calculateInitiativeModifier(14)).toBe(2); // 14 dex = +2
      expect(calculateInitiativeModifier(12)).toBe(1); // 12 dex = +1
      expect(calculateInitiativeModifier(10)).toBe(0); // 10 dex = +0
      expect(calculateInitiativeModifier(8)).toBe(-1); // 8 dex = -1
    });

    it('should handle edge cases', () => {
      expect(calculateInitiativeModifier(1)).toBe(-5); // 1 dex = -5
      expect(calculateInitiativeModifier(20)).toBe(5); // 20 dex = +5
    });
  });

  describe('rollInitiativeWithModifier', () => {
    it('should roll initiative with dexterity modifier', () => {
      const result = rollInitiativeWithModifier(14); // +2 modifier
      expect(result.total).toBe(12); // 10 (mocked d20) + 2 (modifier)
      expect(result.d20Roll).toBe(10);
      expect(result.modifier).toBe(2);
    });

    it('should handle negative modifiers', () => {
      const result = rollInitiativeWithModifier(8); // -1 modifier
      expect(result.total).toBe(9); // 10 (mocked d20) - 1 (modifier)
      expect(result.d20Roll).toBe(10);
      expect(result.modifier).toBe(-1);
    });

    it('should ensure minimum result of 1', () => {
      // Mock a low roll
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll.mockReturnValueOnce(1);

      const result = rollInitiativeWithModifier(1); // -5 modifier
      expect(result.total).toBe(1); // Should not go below 1
      expect(result.d20Roll).toBe(1);
      expect(result.modifier).toBe(-5);
    });
  });

  describe('generateInitiativeEntries', () => {
    it('should create initiative entries with correct structure', () => {
      const entries = generateInitiativeEntries(mockParticipants);

      expect(entries).toHaveLength(3);
      expectMultipleInitiativeStructures(entries, mockParticipants);
    });

    it('should preserve existing initiative values when preserveExisting is true', () => {
      const participantsWithInitiative = createParticipantsWithInitiative(mockParticipants, [5, 10, 15]);

      const entries = generateInitiativeEntries(participantsWithInitiative, true);

      expect(entries[0].initiative).toBe(5);
      expect(entries[1].initiative).toBe(10);
      expect(entries[2].initiative).toBe(15);
    });

    it('should reset initiative values when preserveExisting is false', () => {
      const participantsWithInitiative = createParticipantsWithInitiative(mockParticipants, [5, 10, 15]);

      const entries = generateInitiativeEntries(participantsWithInitiative, false);

      expectAllInitiativeZero(entries);
    });
  });

  describe('rollBulkInitiative', () => {
    it('should roll initiative for all participants', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      const entries = rollInitiativeWithMockAndExpect(mockRoll, 10, mockParticipants);

      // With mocked d20 roll of 10:
      // Rogue: 10 + 4 = 14 (highest)
      // Fighter: 10 + 2 = 12
      // Orc: 10 + 1 = 11 (lowest)
      expectInitiativeOrderSort(entries, ['Rogue', 'Fighter', 'Orc Warrior']);

      expectInitiativeEntryStructure(entries[0], {
        initiative: 14,
        dexterity: 18,
      });
      expectInitiativeEntryStructure(entries[1], {
        initiative: 12,
        dexterity: 14,
      });
      expectInitiativeEntryStructure(entries[2], {
        initiative: 11,
        dexterity: 12,
      });
    });

    it('should sort entries by initiative then dexterity', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupSequentialMockRolls(mockRoll, [15, 10, 15]); // Fighter: 17, Rogue: 14, Orc: 16
      const entries = rollBulkInitiative(mockParticipants);

      // Should be sorted: Fighter (17), Orc (16), Rogue (14)
      expectInitiativeOrderSort(entries, ['Fighter', 'Orc Warrior', 'Rogue']);
      expect(entries[0].initiative).toBe(17);
      expect(entries[1].initiative).toBe(16);
      expect(entries[2].initiative).toBe(14);
    });

    it('should handle dexterity tiebreakers correctly', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupSequentialMockRolls(mockRoll, [10, 8, 11]); // All result in initiative 12
      const entries = rollBulkInitiative(mockParticipants);

      // All have initiative 12, should be sorted by dexterity: Rogue (18), Fighter (14), Orc (12)
      expectInitiativeOrderSort(entries, ['Rogue', 'Fighter', 'Orc Warrior']);
      entries.forEach(entry => expect(entry.initiative).toBe(12));
      expect(entries[0].dexterity).toBe(18);
      expect(entries[1].dexterity).toBe(14);
      expect(entries[2].dexterity).toBe(12);
    });
  });

  describe('rerollInitiative', () => {
    let mockInitiativeEntries: IInitiativeEntry[];

    beforeEach(() => {
      mockInitiativeEntries = [
        createFighterInitiativeEntry({
          participantId: INITIATIVE_PARTICIPANT_IDS.FIGHTER,
          initiative: 15,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        }),
        createRogueInitiativeEntry({
          participantId: INITIATIVE_PARTICIPANT_IDS.ROGUE,
          initiative: 12,
          dexterity: 18,
          isActive: false,
          hasActed: true,
        }),
      ];
    });

    it('should reroll initiative for a single participant', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupInitiativeRollingMock(mockRoll, 10);
      const participantId = INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString();
      const updatedEntries = rerollInitiative(mockInitiativeEntries, participantId);

      // Find the fighter entry (might be in different position due to sorting)
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === participantId);
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.ROGUE.toString());

      expect(fighterEntry).toBeDefined();
      expect(rogueEntry).toBeDefined();

      // Fighter should have new initiative value (10 + 2 = 12)
      expectInitiativeEntryStructure(fighterEntry!, {
        initiative: 12,
        dexterity: 14,
      });

      // Rogue should remain unchanged
      expectInitiativeEntryStructure(rogueEntry!, {
        initiative: 12,
        dexterity: 18,
      });
    });

    it('should reroll initiative for all participants when no participantId provided', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupSequentialMockRolls(mockRoll, [10, 10]);
      const updatedEntries = rerollInitiative(mockInitiativeEntries);

      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString());
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.ROGUE.toString());

      expect(fighterEntry).toBeDefined();
      expect(rogueEntry).toBeDefined();

      // Both should have new initiative values
      expectInitiativeEntryStructure(fighterEntry!, { initiative: 12 }); // 10 + 2
      expectInitiativeEntryStructure(rogueEntry!, { initiative: 14 }); // 10 + 4
    });

    it('should preserve combat state flags during reroll', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupInitiativeRollingMock(mockRoll, 10);
      const participantId = INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString();
      const updatedEntries = rerollInitiative(mockInitiativeEntries, participantId);

      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === participantId);
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.ROGUE.toString());

      // Should preserve isActive and hasActed flags
      expectInitiativeEntryStructure(fighterEntry!, {
        isActive: true,
        hasActed: false,
      });
      expectInitiativeEntryStructure(rogueEntry!, {
        isActive: false,
        hasActed: true,
      });
    });

    it('should handle invalid participant ID gracefully', () => {
      const invalidId = new Types.ObjectId().toString();
      const updatedEntries = rerollInitiative(mockInitiativeEntries, invalidId);

      // Should return entries with same initiative values (no reroll happened)
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString());
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.ROGUE.toString());

      expectInitiativeEntryStructure(fighterEntry!, { initiative: 15 }); // Original value
      expectInitiativeEntryStructure(rogueEntry!, { initiative: 12 }); // Original value
    });

    it('should sort entries after rerolling', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupSequentialMockRolls(mockRoll, [5, 15]); // Fighter: 7, Rogue: 19
      const updatedEntries = rerollInitiative(mockInitiativeEntries);

      expectValidInitiativeOrder(updatedEntries);

      // Should be sorted by initiative: highest first
      // Rogue (15 + 4 = 19) should come before Fighter (5 + 2 = 7)
      expect(updatedEntries[0].initiative).toBe(19);
      expect(updatedEntries[0].dexterity).toBe(18); // Rogue's dexterity
      expect(updatedEntries[1].initiative).toBe(7);
      expect(updatedEntries[1].dexterity).toBe(14); // Fighter's dexterity
    });
  });

  describe('rollSingleInitiative', () => {
    let mockInitiativeEntries: IInitiativeEntry[];

    beforeEach(() => {
      const mockParticipants = createBasicParticipantSet();
      mockInitiativeEntries = generateInitiativeEntries(mockParticipants, false);
      // Set up mock entries with specific initiative values
      mockInitiativeEntries[0].initiative = 15; // Fighter
      mockInitiativeEntries[1].initiative = 12; // Rogue
    });

    it('should update initiative for specified participant', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupInitiativeRollingMock(mockRoll, 15);
      const participantId = INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString();
      const newDexterity = 16;

      const updatedEntries = rollSingleInitiative(mockInitiativeEntries, participantId, newDexterity);
      
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === participantId);
      expectInitiativeEntryStructure(fighterEntry!, { 
        initiative: 18, // 15 + 3 (16 dex modifier)
        dexterity: 16
      });
    });

    it('should not modify other participants', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupInitiativeRollingMock(mockRoll, 12);
      const participantId = INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString();
      
      const updatedEntries = rollSingleInitiative(mockInitiativeEntries, participantId, 14);
      
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === INITIATIVE_PARTICIPANT_IDS.ROGUE.toString());
      expectInitiativeEntryStructure(rogueEntry!, { 
        initiative: 12, // Original value unchanged
        dexterity: 18 // Original value unchanged
      });
    });

    it('should return sorted initiative order', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupInitiativeRollingMock(mockRoll, 20);
      const participantId = INITIATIVE_PARTICIPANT_IDS.FIGHTER.toString();
      
      const updatedEntries = rollSingleInitiative(mockInitiativeEntries, participantId, 14);
      
      expectValidInitiativeOrder(updatedEntries);
      // Fighter should now be first with 22 initiative (20 + 2)
      expect(updatedEntries[0].initiative).toBe(22);
    });

    it('should handle non-existent participant gracefully', () => {
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      setupInitiativeRollingMock(mockRoll, 15);
      const invalidId = new Types.ObjectId().toString();
      
      const updatedEntries = rollSingleInitiative(mockInitiativeEntries, invalidId, 14);
      
      // Should return entries unchanged
      expect(updatedEntries).toHaveLength(mockInitiativeEntries.length);
      expectValidInitiativeOrder(updatedEntries);
    });
  });

  describe('getInitiativeRollBreakdown', () => {
    it('should calculate d20 roll from total and dexterity', () => {
      const result = getInitiativeRollBreakdown(18, 14); // Total: 18, Dex: 14 (+2)
      expect(result.d20Roll).toBe(16); // 18 - 2 = 16
      expect(result.modifier).toBe(2);
    });

    it('should handle edge cases for d20 rolls', () => {
      // Test minimum d20 roll (1)
      const minResult = getInitiativeRollBreakdown(3, 14); // Total: 3, Dex: 14 (+2), should be d20: 1
      expect(minResult.d20Roll).toBe(1);
      expect(minResult.modifier).toBe(2);

      // Test maximum d20 roll (20)
      const maxResult = getInitiativeRollBreakdown(24, 14); // Total: 24, Dex: 14 (+2), should be d20: 20
      expect(maxResult.d20Roll).toBe(20);
      expect(maxResult.modifier).toBe(2);
    });

    it('should handle negative dexterity modifiers', () => {
      const result = getInitiativeRollBreakdown(8, 6); // Total: 8, Dex: 6 (-2)
      expect(result.d20Roll).toBe(10); // 8 - (-2) = 10
      expect(result.modifier).toBe(-2);
    });

    it('should constrain d20 roll to valid range', () => {
      // Test value that would exceed 20
      const highResult = getInitiativeRollBreakdown(30, 8); // Total: 30, Dex: 8 (-1)
      expect(highResult.d20Roll).toBe(20); // Capped at 20
      expect(highResult.modifier).toBe(-1);

      // Test value that would be below 1
      const lowResult = getInitiativeRollBreakdown(1, 18); // Total: 1, Dex: 18 (+4)
      expect(lowResult.d20Roll).toBe(1); // Capped at 1
      expect(lowResult.modifier).toBe(4);
    });
  });

  describe('getDefaultInitiativePreferences', () => {
    it('should return correct default preferences', () => {
      const preferences = getDefaultInitiativePreferences();
      
      expect(preferences.autoRollOnCombatStart).toBe(false);
      expect(preferences.showRollBreakdown).toBe(true);
      expect(preferences.allowPlayerRerolls).toBe(true);
      expect(preferences.tiebreakByDexterity).toBe(true);
    });

    it('should return a new object each time', () => {
      const preferences1 = getDefaultInitiativePreferences();
      const preferences2 = getDefaultInitiativePreferences();
      
      expect(preferences1).not.toBe(preferences2); // Different objects
      expect(preferences1).toEqual(preferences2); // Same values
    });
  });

  describe('shouldAutoRoll', () => {
    it('should return true when autoRollOnCombatStart is true', () => {
      const preferences = { ...getDefaultInitiativePreferences(), autoRollOnCombatStart: true };
      expect(shouldAutoRoll(preferences)).toBe(true);
    });

    it('should return false when autoRollOnCombatStart is false', () => {
      const preferences = { ...getDefaultInitiativePreferences(), autoRollOnCombatStart: false };
      expect(shouldAutoRoll(preferences)).toBe(false);
    });
  });

  describe('canReroll', () => {
    const defaultPreferences = getDefaultInitiativePreferences();

    it('should allow reroll for NPCs regardless of preferences', () => {
      const restrictivePreferences = { ...defaultPreferences, allowPlayerRerolls: false };
      expect(canReroll(restrictivePreferences, 'npc')).toBe(true);
    });

    it('should allow reroll for PCs when allowPlayerRerolls is true', () => {
      const permissivePreferences = { ...defaultPreferences, allowPlayerRerolls: true };
      expect(canReroll(permissivePreferences, 'pc')).toBe(true);
    });

    it('should not allow reroll for PCs when allowPlayerRerolls is false', () => {
      const restrictivePreferences = { ...defaultPreferences, allowPlayerRerolls: false };
      expect(canReroll(restrictivePreferences, 'pc')).toBe(false);
    });

    it('should handle both participant types consistently', () => {
      const preferences = { ...defaultPreferences, allowPlayerRerolls: true };
      expect(canReroll(preferences, 'pc')).toBe(true);
      expect(canReroll(preferences, 'npc')).toBe(true);
    });
  });
});