import {
  characterPresetSchema,
  characterExportSchema,
} from '../character';
import { createCharacterWithDbFields } from './character-test-helpers';

describe('Character Export and Preset Schemas', () => {
  describe('characterPresetSchema', () => {
    it('should validate character preset data', () => {
      const validPreset = {
        name: 'Fighter Preset',
        type: 'npc',
        race: 'human',
        class: 'fighter',
        level: 5,
        abilityScores: {
          strength: 16,
          dexterity: 12,
          constitution: 14,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        hitPoints: 42,
        armorClass: 18,
      };

      expect(() => characterPresetSchema.parse(validPreset)).not.toThrow();
    });

    it('should validate preset constraints', () => {
      const invalidPreset = {
        name: '', // empty name
        type: 'pc',
        race: 'elf',
        class: 'wizard',
        level: 1,
        abilityScores: {
          strength: 8,
          dexterity: 14,
          constitution: 12,
          intelligence: 16,
          wisdom: 13,
          charisma: 10,
        },
        hitPoints: 6,
        armorClass: 12,
      };

      expect(() => characterPresetSchema.parse(invalidPreset)).toThrow();
    });
  });

  describe('characterExportSchema', () => {
    it('should export character without database fields', () => {
      const characterWithDb = createCharacterWithDbFields();
      const result = characterExportSchema.parse(characterWithDb);

      // Should not have database-specific fields
      expect((result as any)._id).toBeUndefined();
      expect((result as any).ownerId).toBeUndefined();
      expect((result as any).partyId).toBeUndefined();
      expect((result as any).createdAt).toBeUndefined();
      expect((result as any).updatedAt).toBeUndefined();

      // Should have character data
      expect(result.name).toBe('Export Character');
      expect(result.type).toBe('pc');
      expect(result.race).toBe('dwarf');
    });
  });
});