import {
  characterCreationSchema,
  characterUpdateSchema,
} from '../character';
import {
  createValidCharacterData,
  generateSpellArray,
  generateEquipmentArray,
} from './character-test-helpers';

describe('Character Creation and Update Schemas', () => {
  describe('characterCreationSchema', () => {
    const validCharacterData = createValidCharacterData();

    it('should validate complete character creation data', () => {
      expect(() =>
        characterCreationSchema.parse(validCharacterData)
      ).not.toThrow();
    });

    it('should validate minimal character creation data', () => {
      const minimalData = {
        name: 'Simple Character',
        type: 'npc',
        race: 'human',
        classes: [
          {
            class: 'rogue',
            level: 1,
            hitDie: 8,
          },
        ],
        abilityScores: {
          strength: 10,
          dexterity: 15,
          constitution: 12,
          intelligence: 13,
          wisdom: 14,
          charisma: 11,
        },
        hitPoints: {
          maximum: 8,
          current: 8,
        },
        armorClass: 13,
        proficiencyBonus: 2,
        savingThrows: {
          strength: false,
          dexterity: true,
          constitution: false,
          intelligence: true,
          wisdom: false,
          charisma: false,
        },
      };

      const result = characterCreationSchema.parse(minimalData);
      expect(result.size).toBe('medium'); // default
      expect(result.speed).toBe(30); // default
      expect(result.hitPoints.temporary).toBe(0); // default
      expect(result.equipment).toEqual([]); // default
      expect(result.spells).toEqual([]); // default
    });

    it('should validate multiclass character', () => {
      const multiclassData = {
        ...validCharacterData,
        classes: [
          {
            class: 'fighter',
            level: 3,
            hitDie: 10,
            subclass: 'Champion',
          },
          {
            class: 'rogue',
            level: 2,
            hitDie: 8,
            subclass: 'Thief',
          },
        ],
      };

      expect(() =>
        characterCreationSchema.parse(multiclassData)
      ).not.toThrow();
    });

    it('should validate custom race character', () => {
      const customRaceData = {
        ...validCharacterData,
        race: 'custom',
        customRace: 'Dragonkin',
      };

      expect(() =>
        characterCreationSchema.parse(customRaceData)
      ).not.toThrow();
    });

    it('should reject invalid class combinations', () => {
      const invalidClasses = {
        ...validCharacterData,
        classes: [], // empty array
      };

      expect(() => characterCreationSchema.parse(invalidClasses)).toThrow();
    });

    it('should reject too many classes (more than 3)', () => {
      const tooManyClasses = {
        ...validCharacterData,
        classes: [
          { class: 'fighter', level: 1, hitDie: 10 },
          { class: 'rogue', level: 1, hitDie: 8 },
          { class: 'wizard', level: 1, hitDie: 6 },
          { class: 'cleric', level: 1, hitDie: 8 }, // 4th class
        ],
      };

      expect(() => characterCreationSchema.parse(tooManyClasses)).toThrow();
    });

    it('should validate hit points constraints', () => {
      const invalidHitPoints = {
        ...validCharacterData,
        hitPoints: {
          maximum: 50,
          current: -5, // negative current HP
          temporary: 10,
        },
      };

      expect(() => characterCreationSchema.parse(invalidHitPoints)).toThrow();
    });

    it('should validate armor class constraints', () => {
      const invalidAC = {
        ...validCharacterData,
        armorClass: 0, // below minimum
      };

      expect(() => characterCreationSchema.parse(invalidAC)).toThrow();
    });

    it('should validate speed constraints', () => {
      const invalidSpeed = {
        ...validCharacterData,
        speed: 150, // above maximum
      };

      expect(() => characterCreationSchema.parse(invalidSpeed)).toThrow();
    });

    it('should validate proficiency bonus range', () => {
      const invalidProficiency = {
        ...validCharacterData,
        proficiencyBonus: 1, // below minimum
      };

      expect(() => characterCreationSchema.parse(invalidProficiency)).toThrow();
    });

    it('should validate equipment array limits', () => {
      const tooMuchEquipment = {
        ...validCharacterData,
        equipment: generateEquipmentArray(101), // 101 items
      };

      expect(() =>
        characterCreationSchema.parse(tooMuchEquipment)
      ).toThrow();
    });

    it('should validate spells array limits', () => {
      const tooManySpells = {
        ...validCharacterData,
        spells: generateSpellArray(201), // 201 spells
      };

      expect(() => characterCreationSchema.parse(tooManySpells)).toThrow();
    });

    it('should validate backstory and notes length limits', () => {
      const longTexts = {
        ...validCharacterData,
        backstory: 'A'.repeat(2001), // 2001 characters
        notes: 'B'.repeat(1001), // 1001 characters
      };

      expect(() => characterCreationSchema.parse(longTexts)).toThrow();
    });

    it('should validate image URL format', () => {
      const validImageData = {
        ...validCharacterData,
        imageUrl: 'https://example.com/character.jpg',
      };

      const invalidImageData = {
        ...validCharacterData,
        imageUrl: 'not-a-url',
      };

      expect(() =>
        characterCreationSchema.parse(validImageData)
      ).not.toThrow();
      expect(() =>
        characterCreationSchema.parse(invalidImageData)
      ).toThrow();
    });
  });

  describe('characterUpdateSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name',
        armorClass: 16,
      };

      expect(() => characterUpdateSchema.parse(partialUpdate)).not.toThrow();
    });

    it('should allow empty updates', () => {
      const emptyUpdate = {};

      expect(() => characterUpdateSchema.parse(emptyUpdate)).not.toThrow();
    });

    it('should validate individual fields in updates', () => {
      const invalidUpdate = {
        armorClass: -5, // invalid AC
      };

      expect(() => characterUpdateSchema.parse(invalidUpdate)).toThrow();
    });
  });
});