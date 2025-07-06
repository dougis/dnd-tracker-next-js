import { Types } from 'mongoose';
import {
  rollInitiativeWithModifier,
  rollBulkInitiative,
  generateInitiativeEntries,
  rerollInitiative,
  calculateInitiativeModifier,
} from '../initiative-rolling';
import { IParticipantReference, IInitiativeEntry } from '../interfaces';

// Mock the rollInitiative function
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  rollInitiative: jest.fn(() => 10), // Mock d20 roll as 10
}));

describe('Initiative Rolling System', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  const mockParticipants: IParticipantReference[] = [
    {
      characterId: new Types.ObjectId(),
      name: 'Fighter',
      type: 'pc',
      initiative: 0,
      armorClass: 18,
      maxHitPoints: 45,
      currentHitPoints: 45,
      temporaryHitPoints: 0,
      conditions: [],
      notes: '',
      isPlayer: false,
      isVisible: true,
      abilityScores: {
        strength: 16,
        dexterity: 14, // +2 modifier
        constitution: 16,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
      },
    },
    {
      characterId: new Types.ObjectId(),
      name: 'Rogue',
      type: 'pc',
      initiative: 0,
      armorClass: 15,
      maxHitPoints: 38,
      currentHitPoints: 38,
      temporaryHitPoints: 0,
      conditions: [],
      notes: '',
      isPlayer: true,
      isVisible: true,
      abilityScores: {
        strength: 10,
        dexterity: 18, // +4 modifier
        constitution: 14,
        intelligence: 12,
        wisdom: 14,
        charisma: 10,
      },
    },
    {
      characterId: new Types.ObjectId(),
      name: 'Orc Warrior',
      type: 'npc',
      initiative: 0,
      armorClass: 13,
      maxHitPoints: 15,
      currentHitPoints: 15,
      temporaryHitPoints: 0,
      conditions: [],
      notes: '',
      isPlayer: false,
      isVisible: true,
      abilityScores: {
        strength: 16,
        dexterity: 12, // +1 modifier
        constitution: 16,
        intelligence: 7,
        wisdom: 11,
        charisma: 10,
      },
    },
  ];

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
      entries.forEach((entry, index) => {
        expect(entry.participantId).toEqual(mockParticipants[index].characterId);
        expect(entry.dexterity).toBe(mockParticipants[index].abilityScores.dexterity);
        expect(entry.isActive).toBe(false);
        expect(entry.hasActed).toBe(false);
        expect(entry.initiative).toBe(0); // Default value
      });
    });

    it('should preserve existing initiative values when preserveExisting is true', () => {
      const participantsWithInitiative = mockParticipants.map((p, index) => ({
        ...p,
        initiative: (index + 1) * 5, // 5, 10, 15
      }));

      const entries = generateInitiativeEntries(participantsWithInitiative, true);
      
      expect(entries[0].initiative).toBe(5);
      expect(entries[1].initiative).toBe(10);
      expect(entries[2].initiative).toBe(15);
    });

    it('should reset initiative values when preserveExisting is false', () => {
      const participantsWithInitiative = mockParticipants.map((p, index) => ({
        ...p,
        initiative: (index + 1) * 5, // 5, 10, 15
      }));

      const entries = generateInitiativeEntries(participantsWithInitiative, false);
      
      entries.forEach(entry => {
        expect(entry.initiative).toBe(0);
      });
    });
  });

  describe('rollBulkInitiative', () => {
    it('should roll initiative for all participants', () => {
      const entries = rollBulkInitiative(mockParticipants);
      
      expect(entries).toHaveLength(3);
      
      // Entries should be sorted by initiative, then dexterity
      // With mocked d20 roll of 10:
      // Rogue: 10 + 4 = 14 (highest)
      // Fighter: 10 + 2 = 12 
      // Orc: 10 + 1 = 11 (lowest)
      
      expect(entries[0].name).toBe('Rogue');
      expect(entries[0].initiative).toBe(14); // 10 + 4
      expect(entries[0].dexterity).toBe(18);
      
      expect(entries[1].name).toBe('Fighter');
      expect(entries[1].initiative).toBe(12); // 10 + 2
      expect(entries[1].dexterity).toBe(14);
      
      expect(entries[2].name).toBe('Orc Warrior');
      expect(entries[2].initiative).toBe(11); // 10 + 1
      expect(entries[2].dexterity).toBe(12);
    });

    it('should sort entries by initiative then dexterity', () => {
      // Mock different d20 rolls for each participant
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll
        .mockReturnValueOnce(15) // Fighter: 15 + 2 = 17
        .mockReturnValueOnce(10) // Rogue: 10 + 4 = 14
        .mockReturnValueOnce(15); // Orc: 15 + 1 = 16

      const entries = rollBulkInitiative(mockParticipants);
      
      // Should be sorted: Fighter (17), Orc (16), Rogue (14)
      expect(entries[0].name).toBe('Fighter');
      expect(entries[0].initiative).toBe(17);
      expect(entries[1].name).toBe('Orc Warrior');
      expect(entries[1].initiative).toBe(16);
      expect(entries[2].name).toBe('Rogue');
      expect(entries[2].initiative).toBe(14);
    });

    it('should handle dexterity tiebreakers correctly', () => {
      // Mock same d20 roll for participants with different dexterity
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll
        .mockReturnValueOnce(10) // Fighter: 10 + 2 = 12, dex 14
        .mockReturnValueOnce(8)  // Rogue: 8 + 4 = 12, dex 18
        .mockReturnValueOnce(11); // Orc: 11 + 1 = 12, dex 12

      const entries = rollBulkInitiative(mockParticipants);
      
      // All have initiative 12, should be sorted by dexterity: Rogue (18), Fighter (14), Orc (12)
      expect(entries[0].name).toBe('Rogue');
      expect(entries[0].dexterity).toBe(18);
      expect(entries[1].name).toBe('Fighter');
      expect(entries[1].dexterity).toBe(14);
      expect(entries[2].name).toBe('Orc Warrior');
      expect(entries[2].dexterity).toBe(12);
    });
  });

  describe('rerollInitiative', () => {
    const fighterParticipantId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const rogueParticipantId = new Types.ObjectId('507f1f77bcf86cd799439012');
    
    const mockInitiativeEntries: IInitiativeEntry[] = [
      {
        participantId: fighterParticipantId,
        initiative: 15,
        dexterity: 14,
        isActive: true,
        hasActed: false,
      },
      {
        participantId: rogueParticipantId,
        initiative: 12,
        dexterity: 18,
        isActive: false,
        hasActed: true,
      },
    ];

    it('should reroll initiative for a single participant', () => {
      // Explicitly set the mock return value for this test
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll.mockReturnValueOnce(10);
      
      const participantId = fighterParticipantId.toString();
      const updatedEntries = rerollInitiative(mockInitiativeEntries, participantId);
      
      // Find the fighter entry (might be in different position due to sorting)
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === participantId);
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === rogueParticipantId.toString());
      
      expect(fighterEntry).toBeDefined();
      expect(rogueEntry).toBeDefined();
      
      // Fighter should have new initiative value (10 + 2 = 12)
      expect(fighterEntry!.initiative).toBe(12);
      expect(fighterEntry!.dexterity).toBe(14);
      
      // Rogue should remain unchanged
      expect(rogueEntry!.initiative).toBe(12);
      expect(rogueEntry!.dexterity).toBe(18);
    });

    it('should reroll initiative for all participants when no participantId provided', () => {
      // Explicitly set the mock return values for this test
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll.mockReturnValueOnce(10).mockReturnValueOnce(10);
      
      const updatedEntries = rerollInitiative(mockInitiativeEntries);
      
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === fighterParticipantId.toString());
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === rogueParticipantId.toString());
      
      expect(fighterEntry).toBeDefined();
      expect(rogueEntry).toBeDefined();
      
      // Both should have new initiative values
      expect(fighterEntry!.initiative).toBe(12); // 10 + 2
      expect(rogueEntry!.initiative).toBe(14); // 10 + 4
    });

    it('should preserve combat state flags during reroll', () => {
      // Explicitly set the mock return value for this test
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll.mockReturnValueOnce(10);
      
      const participantId = fighterParticipantId.toString();
      const updatedEntries = rerollInitiative(mockInitiativeEntries, participantId);
      
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === participantId);
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === rogueParticipantId.toString());
      
      // Should preserve isActive and hasActed flags
      expect(fighterEntry!.isActive).toBe(true);
      expect(fighterEntry!.hasActed).toBe(false);
      expect(rogueEntry!.isActive).toBe(false);
      expect(rogueEntry!.hasActed).toBe(true);
    });

    it('should handle invalid participant ID gracefully', () => {
      const invalidId = new Types.ObjectId().toString();
      const updatedEntries = rerollInitiative(mockInitiativeEntries, invalidId);
      
      // Should return entries with same initiative values (no reroll happened)
      const fighterEntry = updatedEntries.find(e => e.participantId.toString() === fighterParticipantId.toString());
      const rogueEntry = updatedEntries.find(e => e.participantId.toString() === rogueParticipantId.toString());
      
      expect(fighterEntry!.initiative).toBe(15); // Original value
      expect(rogueEntry!.initiative).toBe(12); // Original value
    });

    it('should sort entries after rerolling', () => {
      // Mock different rolls to test sorting
      const mockRoll = jest.requireMock('../utils').rollInitiative;
      mockRoll
        .mockReturnValueOnce(5)  // Fighter: 5 + 2 = 7
        .mockReturnValueOnce(15); // Rogue: 15 + 4 = 19

      const updatedEntries = rerollInitiative(mockInitiativeEntries);
      
      // Should be sorted by initiative: highest first
      // Rogue (15 + 4 = 19) should come before Fighter (5 + 2 = 7)
      expect(updatedEntries[0].initiative).toBe(19);
      expect(updatedEntries[0].dexterity).toBe(18); // Rogue's dexterity
      expect(updatedEntries[1].initiative).toBe(7);
      expect(updatedEntries[1].dexterity).toBe(14); // Fighter's dexterity
    });
  });
});