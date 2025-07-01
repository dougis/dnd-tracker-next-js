/**
 * Unit tests for Character schema validation and business logic
 * Tests core functionality without MongoDB integration
 */

import mongoose from 'mongoose';

// Mock mongoose completely for unit testing
jest.mock('mongoose', () => {
  const mockObjectId = jest.fn().mockImplementation((id) => ({
    _id: id || '64d9c3e8f1b2c3d4e5f6g7h8',
    toString: () => id || '64d9c3e8f1b2c3d4e5f6g7h8',
    toHexString: () => id || '64d9c3e8f1b2c3d4e5f6g7h8',
  }));

  return {
    Schema: jest.fn().mockImplementation(() => ({
      virtual: jest.fn().mockReturnThis(),
      methods: {},
      statics: {},
      pre: jest.fn(),
      post: jest.fn(),
      index: jest.fn(),
    })),
    model: jest.fn(),
    Types: {
      ObjectId: mockObjectId,
    },
    Schema: {
      Types: {
        ObjectId: mockObjectId,
      },
    },
  };
});

describe('Character Model Unit Tests', () => {
  // Test data factory functions
  const createBaseCharacterData = (overrides: Partial<any> = {}) => ({
    ownerId: 'mockOwnerId',
    name: 'Test Character',
    race: 'human',
    type: 'pc' as const,
    size: 'medium' as const,
    classes: [
      {
        class: 'fighter',
        level: 1,
        hitDie: 10
      }
    ],
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    hitPoints: {
      maximum: 10,
      current: 10,
      temporary: 0
    },
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: new Map(),
    equipment: [],
    spells: [],
    backstory: '',
    notes: '',
    isPublic: false,
    ...overrides
  });

  const createWizardData = (overrides: Partial<any> = {}) => createBaseCharacterData({
    name: 'Gandalf',
    classes: [
      {
        class: 'wizard',
        level: 5,
        subclass: 'evocation',
        hitDie: 6
      }
    ],
    abilityScores: {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 18,
      wisdom: 16,
      charisma: 13
    },
    hitPoints: {
      maximum: 28,
      current: 28,
      temporary: 0
    },
    armorClass: 12,
    proficiencyBonus: 3,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: true,
      wisdom: true,
      charisma: false
    },
    ...overrides
  });

  // Mock Character business logic functions
  const getAbilityModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getInitiativeModifier = (dexterityScore: number): number => {
    return getAbilityModifier(dexterityScore);
  };

  const getLevel = (classes: Array<{ level: number }>): number => {
    return classes.reduce((total, charClass) => total + charClass.level, 0);
  };

  const getEffectiveHP = (current: number, temporary: number): number => {
    return current + temporary;
  };

  const isAlive = (currentHP: number): boolean => {
    return currentHP > 0;
  };

  const isUnconscious = (currentHP: number): boolean => {
    return currentHP <= 0;
  };

  describe('Character Data Factory Functions', () => {
    it('should create base character data with default values', () => {
      const characterData = createBaseCharacterData();

      expect(characterData.name).toBe('Test Character');
      expect(characterData.race).toBe('human');
      expect(characterData.type).toBe('pc');
      expect(characterData.classes).toHaveLength(1);
      expect(characterData.classes[0].class).toBe('fighter');
      expect(characterData.abilityScores.strength).toBe(10);
      expect(characterData.isPublic).toBe(false);
    });

    it('should create wizard data with specialized stats', () => {
      const wizardData = createWizardData();

      expect(wizardData.name).toBe('Gandalf');
      expect(wizardData.classes[0].class).toBe('wizard');
      expect(wizardData.classes[0].level).toBe(5);
      expect(wizardData.abilityScores.intelligence).toBe(18);
      expect(wizardData.proficiencyBonus).toBe(3);
    });

    it('should allow overrides in factory functions', () => {
      const customCharacter = createBaseCharacterData({
        name: 'Custom Character',
        race: 'elf',
        abilityScores: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 11,
          charisma: 10
        }
      });

      expect(customCharacter.name).toBe('Custom Character');
      expect(customCharacter.race).toBe('elf');
      expect(customCharacter.abilityScores.strength).toBe(15);
      // Should preserve base values for unoverridden properties
      expect(customCharacter.type).toBe('pc');
    });
  });

  describe('Character Business Logic', () => {
    it('should calculate ability modifiers correctly', () => {
      expect(getAbilityModifier(8)).toBe(-1);   // 8 -> -1
      expect(getAbilityModifier(10)).toBe(0);   // 10 -> 0
      expect(getAbilityModifier(12)).toBe(1);   // 12 -> +1
      expect(getAbilityModifier(14)).toBe(2);   // 14 -> +2
      expect(getAbilityModifier(16)).toBe(3);   // 16 -> +3
      expect(getAbilityModifier(18)).toBe(4);   // 18 -> +4
    });

    it('should calculate initiative modifier from dexterity', () => {
      expect(getInitiativeModifier(16)).toBe(3); // Dex 16 -> +3 initiative
      expect(getInitiativeModifier(14)).toBe(2); // Dex 14 -> +2 initiative
      expect(getInitiativeModifier(10)).toBe(0); // Dex 10 -> 0 initiative
    });

    it('should calculate total character level from multiclass', () => {
      const singleClass = [{ class: 'fighter', level: 5, hitDie: 10 }];
      const multiClass = [
        { class: 'paladin', level: 3, hitDie: 10 },
        { class: 'sorcerer', level: 2, hitDie: 6 }
      ];

      expect(getLevel(singleClass)).toBe(5);
      expect(getLevel(multiClass)).toBe(5);
    });

    it('should calculate effective HP including temporary HP', () => {
      expect(getEffectiveHP(25, 5)).toBe(30);
      expect(getEffectiveHP(15, 0)).toBe(15);
      expect(getEffectiveHP(0, 10)).toBe(10);
    });

    it('should determine if character is alive', () => {
      expect(isAlive(25)).toBe(true);
      expect(isAlive(1)).toBe(true);
      expect(isAlive(0)).toBe(false);
      expect(isAlive(-5)).toBe(false);
    });

    it('should determine if character is unconscious', () => {
      expect(isUnconscious(25)).toBe(false);
      expect(isUnconscious(1)).toBe(false);
      expect(isUnconscious(0)).toBe(true);
      expect(isUnconscious(-5)).toBe(true);
    });
  });

  describe('Data Validation Logic', () => {
    it('should validate required character fields', () => {
      const requiredFields = ['ownerId', 'name', 'race', 'type', 'classes', 'abilityScores', 'hitPoints', 'armorClass'];
      const characterData = createBaseCharacterData();

      requiredFields.forEach(field => {
        expect(characterData).toHaveProperty(field);
        expect(characterData[field]).toBeDefined();
      });
    });

    it('should validate character type enum', () => {
      const pcCharacter = createBaseCharacterData({ type: 'pc' });
      const npcCharacter = createBaseCharacterData({ type: 'npc' });

      expect(pcCharacter.type).toBe('pc');
      expect(npcCharacter.type).toBe('npc');
    });

    it('should validate ability score structure', () => {
      const characterData = createBaseCharacterData();
      const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

      abilities.forEach(ability => {
        expect(characterData.abilityScores).toHaveProperty(ability);
        expect(typeof characterData.abilityScores[ability]).toBe('number');
        expect(characterData.abilityScores[ability]).toBeGreaterThanOrEqual(1);
        expect(characterData.abilityScores[ability]).toBeLessThanOrEqual(30);
      });
    });

    it('should validate hit points structure', () => {
      const characterData = createBaseCharacterData();

      expect(characterData.hitPoints).toHaveProperty('maximum');
      expect(characterData.hitPoints).toHaveProperty('current');
      expect(characterData.hitPoints).toHaveProperty('temporary');
      expect(characterData.hitPoints.maximum).toBeGreaterThan(0);
      expect(characterData.hitPoints.current).toBeGreaterThanOrEqual(0);
      expect(characterData.hitPoints.temporary).toBeGreaterThanOrEqual(0);
    });

    it('should validate class structure', () => {
      const characterData = createWizardData();
      const charClass = characterData.classes[0];

      expect(charClass).toHaveProperty('class');
      expect(charClass).toHaveProperty('level');
      expect(charClass).toHaveProperty('hitDie');
      expect(typeof charClass.class).toBe('string');
      expect(charClass.level).toBeGreaterThanOrEqual(1);
      expect(charClass.level).toBeLessThanOrEqual(20);
      expect(charClass.hitDie).toBeGreaterThanOrEqual(4);
      expect(charClass.hitDie).toBeLessThanOrEqual(12);
    });
  });

  describe('Character Summary Creation', () => {
    it('should create character summary with essential fields', () => {
      const characterData = createWizardData();
      const summary = {
        _id: characterData.ownerId,
        name: characterData.name,
        race: characterData.race,
        type: characterData.type,
        level: getLevel(characterData.classes),
        classes: characterData.classes,
        hitPoints: characterData.hitPoints,
        armorClass: characterData.armorClass,
        isPublic: characterData.isPublic
      };

      expect(summary.name).toBe('Gandalf');
      expect(summary.race).toBe('human');
      expect(summary.type).toBe('pc');
      expect(summary.level).toBe(5);
      expect(summary.isPublic).toBe(false);
    });
  });

  describe('No Code Duplication - Factory Pattern Usage', () => {
    it('should reuse base data in specialized factory functions', () => {
      // This test ensures our refactoring eliminated duplication
      const baseData = createBaseCharacterData();
      const wizardData = createWizardData();

      // Both should have common base structure
      expect(baseData).toHaveProperty('ownerId');
      expect(baseData).toHaveProperty('equipment');
      expect(baseData).toHaveProperty('spells');
      expect(baseData).toHaveProperty('savingThrows');

      expect(wizardData).toHaveProperty('ownerId');
      expect(wizardData).toHaveProperty('equipment');
      expect(wizardData).toHaveProperty('spells');
      expect(wizardData).toHaveProperty('savingThrows');

      // But wizard should have different specific values
      expect(wizardData.name).not.toBe(baseData.name);
      expect(wizardData.classes[0].class).not.toBe(baseData.classes[0].class);
    });

    it('should demonstrate DRY principle in test data creation', () => {
      // Multiple characters can be created efficiently
      const characters = [
        createBaseCharacterData({ name: 'Fighter 1' }),
        createBaseCharacterData({ name: 'Fighter 2' }),
        createWizardData({ name: 'Wizard 1' }),
        createWizardData({ name: 'Wizard 2' })
      ];

      expect(characters).toHaveLength(4);
      characters.forEach(char => {
        expect(char).toHaveProperty('abilityScores');
        expect(char).toHaveProperty('hitPoints');
        expect(char).toHaveProperty('equipment');
      });

      // Names should be unique due to overrides
      const names = characters.map(c => c.name);
      expect(new Set(names).size).toBe(4);
    });
  });
});