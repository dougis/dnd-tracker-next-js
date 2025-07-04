import { NPCTemplateImporter } from '../NPCTemplateImporter';
import { ImportFormat } from '@/types/npc';

describe('NPCTemplateImporter', () => {
  describe('parseImportData', () => {
    describe('JSON format', () => {
      it('should parse valid JSON data correctly', () => {
        const jsonData = {
          name: 'Test Monster',
          creatureType: 'beast',
          challengeRating: 2,
          size: 'large',
          abilityScores: {
            strength: 16,
            dexterity: 12,
            constitution: 14,
            intelligence: 8,
            wisdom: 10,
            charisma: 6,
          },
          hitPoints: { maximum: 25, current: 25 },
          armorClass: 14,
          speed: 40,
          equipment: [
            { name: 'Natural Weapons', type: 'weapon' },
            'Thick Hide',
          ],
          spells: [{ name: 'Cure Wounds', level: 1 }],
          actions: [{ name: 'Bite', type: 'melee' }],
          behavior: {
            personality: 'Aggressive',
            motivations: 'Territory',
            tactics: 'Charge',
          },
        };

        const result = NPCTemplateImporter.parseImportData(jsonData, 'json');

        expect(result.name).toBe('Test Monster');
        expect(result.category).toBe('beast');
        expect(result.challengeRating).toBe(2);
        expect(result.size).toBe('large');
        expect(result.stats.abilityScores).toEqual(jsonData.abilityScores);
        expect(result.stats.hitPoints).toEqual({ ...jsonData.hitPoints, temporary: 0 });
        expect(result.stats.armorClass).toBe(14);
        expect(result.stats.speed).toBe(40);
        expect(result.equipment).toHaveLength(2);
        expect(result.spells).toEqual(jsonData.spells);
        expect(result.actions).toEqual(jsonData.actions);
        expect(result.behavior).toEqual(jsonData.behavior);
        expect(result.isSystem).toBe(false);
      });

      it('should use defaults for missing optional fields', () => {
        const minimalData = {
          name: 'Minimal Monster',
          challengeRating: 1,
        };

        const result = NPCTemplateImporter.parseImportData(minimalData, 'json');

        expect(result.name).toBe('Minimal Monster');
        expect(result.category).toBe('humanoid');
        expect(result.size).toBe('medium');
        expect(result.stats.abilityScores).toEqual({
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10,
        });
        expect(result.stats.hitPoints).toEqual({ maximum: 1, current: 1, temporary: 0 });
        expect(result.stats.armorClass).toBe(10);
        expect(result.stats.speed).toBe(30);
        expect(result.equipment).toEqual([]);
        expect(result.spells).toEqual([]);
        expect(result.actions).toEqual([]);
        expect(result.behavior).toBeUndefined();
      });

      it('should throw error for missing required fields', () => {
        expect(() => {
          NPCTemplateImporter.parseImportData({}, 'json');
        }).toThrow('name is required');

        expect(() => {
          NPCTemplateImporter.parseImportData({ name: 'Test' }, 'json');
        }).toThrow('challengeRating is required');
      });

      it('should handle challengeRating of 0', () => {
        const data = {
          name: 'Weak Creature',
          challengeRating: 0,
        };

        const result = NPCTemplateImporter.parseImportData(data, 'json');
        expect(result.challengeRating).toBe(0);
      });

      it('should handle alternative field names', () => {
        const data = {
          name: 'Test',
          category: 'undead',
          creatureType: 'humanoid', // Should be overridden by category
          challengeRating: 1,
        };

        const result = NPCTemplateImporter.parseImportData(data, 'json');
        expect(result.category).toBe('humanoid'); // creatureType takes precedence
      });

      it('should process equipment array correctly', () => {
        const data = {
          name: 'Armed Warrior',
          challengeRating: 1,
          equipment: [
            { name: 'Sword', type: 'weapon', quantity: 1, magical: true },
            'Shield', // String format
            { name: 'Armor', type: 'armor' }, // Missing optional fields
          ],
        };

        const result = NPCTemplateImporter.parseImportData(data, 'json');
        expect(result.equipment).toEqual([
          { name: 'Sword', type: 'weapon', quantity: 1, magical: true },
          { name: 'Shield' },
          { name: 'Armor', type: 'armor' },
        ]);
      });
    });

    describe('D&D Beyond format', () => {
      it('should parse D&D Beyond data correctly', () => {
        const dndbeyondData = {
          name: 'Orc Warrior',
          cr: '1/2',
          stats: {
            str: 16,
            dex: 12,
            con: 16,
            int: 7,
            wis: 11,
            cha: 10,
          },
          hp: 15,
          ac: 13,
          speed: 30,
        };

        const result = NPCTemplateImporter.parseImportData(dndbeyondData, 'dndbeyond');

        expect(result.name).toBe('Orc Warrior');
        expect(result.category).toBe('humanoid');
        expect(result.challengeRating).toBe(0.5);
        expect(result.size).toBe('medium');
        expect(result.stats.abilityScores).toEqual({
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 7,
          wisdom: 11,
          charisma: 10,
        });
        expect(result.stats.hitPoints).toEqual({ maximum: 15, current: 15, temporary: 0 });
        expect(result.stats.armorClass).toBe(13);
        expect(result.stats.speed).toBe(30);
        expect(result.isSystem).toBe(false);
      });

      it('should handle missing fields with defaults', () => {
        const minimalData = {
          name: 'Simple Creature',
        };

        const result = NPCTemplateImporter.parseImportData(minimalData, 'dndbeyond');

        expect(result.stats.abilityScores).toEqual({
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10,
        });
        expect(result.stats.hitPoints).toEqual({ maximum: 1, current: 1, temporary: 0 });
        expect(result.stats.armorClass).toBe(10);
        expect(result.stats.speed).toBe(30);
      });

      it('should throw error for missing name', () => {
        expect(() => {
          NPCTemplateImporter.parseImportData({}, 'dndbeyond');
        }).toThrow('name is required');
      });
    });

    describe('Unsupported formats', () => {
      it('should throw error for Roll20 format', () => {
        expect(() => {
          NPCTemplateImporter.parseImportData({}, 'roll20');
        }).toThrow('Roll20 import not yet implemented');
      });

      it('should throw error for custom format', () => {
        expect(() => {
          NPCTemplateImporter.parseImportData({}, 'custom');
        }).toThrow('Custom import not yet implemented');
      });

      it('should throw error for unsupported format', () => {
        expect(() => {
          NPCTemplateImporter.parseImportData({}, 'unknown' as ImportFormat);
        }).toThrow('Unsupported import format: unknown');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle hitPoints with temporary field', () => {
      const data = {
        name: 'Test',
        challengeRating: 1,
        hitPoints: { maximum: 20, current: 15, temporary: 5 },
      };

      const result = NPCTemplateImporter.parseImportData(data, 'json');
      expect(result.stats.hitPoints).toEqual({ maximum: 20, current: 15, temporary: 5 });
    });

    it('should handle hitPoints without temporary field', () => {
      const data = {
        name: 'Test',
        challengeRating: 1,
        hitPoints: { maximum: 20, current: 15 },
      };

      const result = NPCTemplateImporter.parseImportData(data, 'json');
      expect(result.stats.hitPoints).toEqual({ maximum: 20, current: 15, temporary: 0 });
    });

    it('should handle numeric challenge rating in D&D Beyond format', () => {
      const data = {
        name: 'Test',
        cr: 2, // Numeric instead of string
      };

      const result = NPCTemplateImporter.parseImportData(data, 'dndbeyond');
      expect(result.challengeRating).toBe(2);
    });
  });
});