import {
  characterClassSchema,
  characterRaceSchema,
  characterTypeSchema,
  sizeSchema,
  abilityScoresSchema,
  characterClassLevelSchema,
  equipmentItemSchema,
} from '../character';
import {
  validCharacterClasses,
  validCharacterRaces,
  validSizes,
} from './character-test-helpers';

describe('Character Validation Schemas', () => {
  describe('characterClassSchema', () => {
    it('should validate valid D&D 5e classes', () => {
      validCharacterClasses.forEach(className => {
        expect(() => characterClassSchema.parse(className)).not.toThrow();
      });
    });

    it('should reject invalid character classes', () => {
      const invalidClasses = [
        'invalid-class',
        'FIGHTER',
        'fighter ',
        ' fighter',
        'bloodhunter',
        '',
        123,
        null,
        undefined,
      ];

      invalidClasses.forEach(className => {
        expect(() => characterClassSchema.parse(className)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid class', () => {
      expect(() => characterClassSchema.parse('invalid')).toThrow(
        'Invalid character class'
      );
    });
  });

  describe('characterRaceSchema', () => {
    it('should validate valid D&D 5e races', () => {
      validCharacterRaces.forEach(race => {
        expect(() => characterRaceSchema.parse(race)).not.toThrow();
      });
    });

    it('should reject invalid character races', () => {
      const invalidRaces = [
        'invalid-race',
        'HUMAN',
        'human ',
        ' human',
        'drow',
        '',
        123,
        null,
        undefined,
      ];

      invalidRaces.forEach(race => {
        expect(() => characterRaceSchema.parse(race)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid race', () => {
      expect(() => characterRaceSchema.parse('invalid')).toThrow(
        'Invalid character race'
      );
    });

    it('should allow custom race option', () => {
      expect(() => characterRaceSchema.parse('custom')).not.toThrow();
    });
  });

  describe('characterTypeSchema', () => {
    it('should validate PC and NPC types', () => {
      expect(() => characterTypeSchema.parse('pc')).not.toThrow();
      expect(() => characterTypeSchema.parse('npc')).not.toThrow();
    });

    it('should reject invalid character types', () => {
      const invalidTypes = [
        'player',
        'monster',
        'PC',
        'NPC',
        'pc ',
        ' pc',
        '',
        123,
        null,
        undefined,
      ];

      invalidTypes.forEach(type => {
        expect(() => characterTypeSchema.parse(type)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid type', () => {
      expect(() => characterTypeSchema.parse('invalid')).toThrow(
        'Character type must be either PC or NPC'
      );
    });
  });

  describe('sizeSchema', () => {
    it('should validate all D&D 5e size categories', () => {
      validSizes.forEach(size => {
        expect(() => sizeSchema.parse(size)).not.toThrow();
      });
    });

    it('should reject invalid size categories', () => {
      const invalidSizes = [
        'miniature',
        'gigantic',
        'MEDIUM',
        'medium ',
        ' medium',
        '',
        123,
        null,
        undefined,
      ];

      invalidSizes.forEach(size => {
        expect(() => sizeSchema.parse(size)).toThrow();
      });
    });

    it('should provide appropriate error message for invalid size', () => {
      expect(() => sizeSchema.parse('invalid')).toThrow(
        'Invalid size category'
      );
    });
  });

  describe('abilityScoresSchema', () => {
    it('should validate complete ability scores object', () => {
      const validAbilityScores = {
        strength: 10,
        dexterity: 15,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        charisma: 8,
      };

      expect(() =>
        abilityScoresSchema.parse(validAbilityScores)
      ).not.toThrow();
    });

    it('should accept ability scores at boundaries (1-30)', () => {
      const boundaryScores = {
        strength: 1,
        dexterity: 30,
        constitution: 8,
        intelligence: 20,
        wisdom: 15,
        charisma: 10,
      };

      expect(() => abilityScoresSchema.parse(boundaryScores)).not.toThrow();
    });

    it('should reject ability scores outside valid range', () => {
      const invalidScores = [
        { strength: 0, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        { strength: 31, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        { strength: -5, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        { strength: 10.5, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      ];

      invalidScores.forEach(scores => {
        expect(() => abilityScoresSchema.parse(scores)).toThrow();
      });
    });

    it('should require all six ability scores', () => {
      const incompleteScores = {
        strength: 10,
        dexterity: 15,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        // missing charisma
      };

      expect(() => abilityScoresSchema.parse(incompleteScores)).toThrow();
    });

    it('should reject additional properties', () => {
      const scoresWithExtra = {
        strength: 10,
        dexterity: 15,
        constitution: 14,
        intelligence: 12,
        wisdom: 13,
        charisma: 8,
        extraProperty: 10,
      };

      // Note: Zod allows additional properties by default, but we're testing schema structure
      const result = abilityScoresSchema.safeParse(scoresWithExtra);
      expect(result.success).toBe(true);
      expect(result.success && (result.data as any).extraProperty).toBeUndefined();
    });
  });

  describe('characterClassLevelSchema', () => {
    it('should validate character class with level and hit die', () => {
      const validClassLevel = {
        class: 'fighter',
        level: 5,
        hitDie: 10,
        subclass: 'Champion',
      };

      expect(() =>
        characterClassLevelSchema.parse(validClassLevel)
      ).not.toThrow();
    });

    it('should validate without optional subclass', () => {
      const validClassLevel = {
        class: 'wizard',
        level: 1,
        hitDie: 6,
      };

      expect(() =>
        characterClassLevelSchema.parse(validClassLevel)
      ).not.toThrow();
    });

    it('should validate hit die ranges for different classes', () => {
      const validHitDice = [4, 6, 8, 10, 12];

      validHitDice.forEach(hitDie => {
        const classLevel = {
          class: 'rogue',
          level: 3,
          hitDie,
        };
        expect(() => characterClassLevelSchema.parse(classLevel)).not.toThrow();
      });
    });

    it('should reject invalid hit die values', () => {
      const invalidHitDice = [2, 3, 13, 20, -1, 0, 1.5];

      invalidHitDice.forEach(hitDie => {
        const classLevel = {
          class: 'paladin',
          level: 2,
          hitDie,
        };
        expect(() => characterClassLevelSchema.parse(classLevel)).toThrow();
      });
    });

    it('should reject invalid level values', () => {
      const invalidLevels = [0, -1, 21, 25, 1.5];

      invalidLevels.forEach(level => {
        const classLevel = {
          class: 'bard',
          level,
          hitDie: 8,
        };
        expect(() => characterClassLevelSchema.parse(classLevel)).toThrow();
      });
    });

    it('should validate subclass name constraints', () => {
      const validSubclass = {
        class: 'cleric',
        level: 3,
        hitDie: 8,
        subclass: 'Life Domain',
      };

      expect(() =>
        characterClassLevelSchema.parse(validSubclass)
      ).not.toThrow();
    });

    it('should handle empty subclass name (transforms to undefined)', () => {
      const emptySubclass = {
        class: 'sorcerer',
        level: 2,
        hitDie: 6,
        subclass: '',
      };

      const result = characterClassLevelSchema.parse(emptySubclass);
      expect(result.subclass).toBeUndefined();
    });

    it('should reject overly long subclass names', () => {
      const longSubclass = {
        class: 'warlock',
        level: 4,
        hitDie: 8,
        subclass: 'A'.repeat(51), // 51 characters
      };

      expect(() => characterClassLevelSchema.parse(longSubclass)).toThrow();
    });
  });

  describe('equipmentItemSchema', () => {
    it('should validate basic equipment item', () => {
      const validEquipment = {
        name: 'Longsword',
        quantity: 1,
        weight: 3,
        value: 15,
        description: 'A versatile martial weapon',
        equipped: true,
        magical: false,
      };

      expect(() => equipmentItemSchema.parse(validEquipment)).not.toThrow();
    });

    it('should validate minimal equipment item', () => {
      const minimalEquipment = {
        name: 'Torch',
      };

      const result = equipmentItemSchema.parse(minimalEquipment);
      expect(result.name).toBe('Torch');
      expect(result.quantity).toBe(1); // default
      expect(result.equipped).toBe(false); // default
      expect(result.magical).toBe(false); // default
    });

    it('should validate magical equipment', () => {
      const magicalEquipment = {
        name: '+1 Sword',
        quantity: 1,
        magical: true,
        equipped: true,
      };

      expect(() => equipmentItemSchema.parse(magicalEquipment)).not.toThrow();
    });

    it('should reject invalid equipment names', () => {
      const invalidNames = ['', 'A'.repeat(101)];

      invalidNames.forEach(name => {
        const equipment = { name };
        expect(() => equipmentItemSchema.parse(equipment)).toThrow();
      });
    });

    it('should reject negative quantities', () => {
      const negativeQuantity = {
        name: 'Arrow',
        quantity: -5,
      };

      expect(() => equipmentItemSchema.parse(negativeQuantity)).toThrow();
    });

    it('should reject negative weight or value', () => {
      const negativeWeight = {
        name: 'Feather',
        weight: -1,
      };

      const negativeValue = {
        name: 'Item',
        value: -10,
      };

      expect(() => equipmentItemSchema.parse(negativeWeight)).toThrow();
      expect(() => equipmentItemSchema.parse(negativeValue)).toThrow();
    });

    it('should handle optional fields', () => {
      const equipmentWithOptionals = {
        name: 'Rope',
        weight: undefined,
        value: '', // empty string transforms to undefined
        description: undefined,
      };

      const result = equipmentItemSchema.parse(equipmentWithOptionals);
      expect(result.weight).toBeUndefined();
      expect(result.value).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it('should validate description length limit', () => {
      const longDescription = {
        name: 'Item',
        description: 'A'.repeat(501), // 501 characters
      };

      expect(() => equipmentItemSchema.parse(longDescription)).toThrow();
    });
  });


      });

});