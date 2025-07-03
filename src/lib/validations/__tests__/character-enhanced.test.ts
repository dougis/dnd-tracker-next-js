import {
  enhancedCharacterCreationSchema,
  RealtimeValidator,
  CharacterConsistencyChecker,
  CHARACTER_VALIDATION_MESSAGES,
} from '../character-enhanced';
import type { CharacterCreation } from '../character';

describe('Enhanced Character Validation', () => {
  const validCharacterData: CharacterCreation = {
    name: 'Test Character',
    type: 'pc',
    race: 'human',
    size: 'medium',
    classes: [{ class: 'fighter', level: 5, hitDie: 10 }],
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    hitPoints: { maximum: 45, current: 45, temporary: 0 },
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 3,
    savingThrows: {
      strength: true,
      dexterity: false,
      constitution: true,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    skills: {},
    equipment: [],
    spells: [],
  };

  describe('Enhanced Character Creation Schema', () => {
    it('should validate a complete valid character', () => {
      const result = enhancedCharacterCreationSchema.safeParse(validCharacterData);
      expect(result.success).toBe(true);
    });

    it('should reject characters with ability scores too low', () => {
      const invalidData = {
        ...validCharacterData,
        abilityScores: {
          ...validCharacterData.abilityScores,
          strength: 0,
        },
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('1');
      }
    });

    it('should reject characters with ability scores too high', () => {
      const invalidData = {
        ...validCharacterData,
        abilityScores: {
          ...validCharacterData.abilityScores,
          strength: 31,
        },
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('30');
      }
    });

    it('should reject characters with total ability scores too low', () => {
      const invalidData = {
        ...validCharacterData,
        abilityScores: {
          strength: 3,
          dexterity: 3,
          constitution: 3,
          intelligence: 3,
          wisdom: 3,
          charisma: 3,
        },
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('unusually low');
      }
    });

    it('should reject characters with duplicate classes', () => {
      const invalidData = {
        ...validCharacterData,
        classes: [
          { class: 'fighter', level: 3, hitDie: 10 },
          { class: 'fighter', level: 2, hitDie: 10 },
        ],
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('duplicate');
      }
    });

    it('should reject characters with total level exceeding 20', () => {
      const invalidData = {
        ...validCharacterData,
        classes: [
          { class: 'fighter', level: 15, hitDie: 10 },
          { class: 'rogue', level: 10, hitDie: 8 },
        ],
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('exceed 20');
      }
    });

    it('should reject characters with current HP exceeding maximum', () => {
      const invalidData = {
        ...validCharacterData,
        hitPoints: { maximum: 30, current: 35, temporary: 0 },
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('exceed maximum');
      }
    });

    it('should require custom race name when race is custom', () => {
      const invalidData = {
        ...validCharacterData,
        race: 'custom' as const,
        customRace: '',
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Custom race name is required');
      }
    });

    it('should allow valid custom race', () => {
      const validData = {
        ...validCharacterData,
        race: 'custom' as const,
        customRace: 'Dragonkin',
      };

      const result = enhancedCharacterCreationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject duplicate equipment names', () => {
      const invalidData = {
        ...validCharacterData,
        equipment: [
          { name: 'Sword', quantity: 1, equipped: true, magical: false },
          { name: 'sword', quantity: 1, equipped: false, magical: false }, // Same name, different case
        ],
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('duplicate');
      }
    });

    it('should reject duplicate spell names', () => {
      const invalidData = {
        ...validCharacterData,
        spells: [
          {
            name: 'Fireball',
            level: 3,
            school: 'evocation',
            castingTime: '1 action',
            range: '150 feet',
            components: { verbal: true, somatic: true, material: false },
            duration: 'Instantaneous',
            description: 'A bright streak flashes...',
            prepared: true,
          },
          {
            name: 'fireball', // Same name, different case
            level: 3,
            school: 'evocation',
            castingTime: '1 action',
            range: '150 feet',
            components: { verbal: true, somatic: true, material: false },
            duration: 'Instantaneous',
            description: 'A bright streak flashes...',
            prepared: false,
          },
        ],
      };

      const result = enhancedCharacterCreationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('duplicate');
      }
    });
  });

  describe('RealtimeValidator', () => {
    it('should validate character name field', () => {
      const error = RealtimeValidator.validateFieldValue('name', '');
      expect(error).not.toBeNull();
      expect(error?.message).toContain('at least 1 character');

      const validError = RealtimeValidator.validateFieldValue('name', 'Valid Name');
      expect(validError).toBeNull();
    });

    it('should validate ability score fields', () => {
      const lowError = RealtimeValidator.validateFieldValue('abilityScores.strength', 0);
      expect(lowError).not.toBeNull();
      expect(lowError?.message).toContain('cannot be lower than 1');

      const highError = RealtimeValidator.validateFieldValue('abilityScores.strength', 31);
      expect(highError).not.toBeNull();
      expect(highError?.message).toContain('cannot be higher than 30');

      const validError = RealtimeValidator.validateFieldValue('abilityScores.strength', 15);
      expect(validError).toBeNull();
    });

    it('should validate hit points with context', () => {
      const characterContext = {
        hitPoints: { maximum: 30, current: 30, temporary: 0 },
      };

      const error = RealtimeValidator.validateFieldValue(
        'hitPoints.current',
        35,
        characterContext
      );
      expect(error).not.toBeNull();
      expect(error?.message).toContain('exceed maximum');
    });

    it('should validate custom race requirement', () => {
      const characterContext = { race: 'custom' };

      const error = RealtimeValidator.validateFieldValue(
        'customRace',
        '',
        characterContext
      );
      expect(error).not.toBeNull();
      expect(error?.message).toContain('Custom race name is required');
    });

    it('should validate armor class range', () => {
      const lowError = RealtimeValidator.validateFieldValue('armorClass', 0);
      expect(lowError).not.toBeNull();

      const highError = RealtimeValidator.validateFieldValue('armorClass', 31);
      expect(highError).not.toBeNull();

      const validError = RealtimeValidator.validateFieldValue('armorClass', 15);
      expect(validError).toBeNull();
    });

    it('should validate complete character data', () => {
      const result = RealtimeValidator.validateCharacterData(validCharacterData);
      expect(result.success).toBe(true);
    });

    it('should validate update data', () => {
      const updateData = {
        name: 'Updated Name',
      };

      const result = RealtimeValidator.validateUpdateData(updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('CharacterConsistencyChecker', () => {
    it('should warn about low hit points for level', () => {
      const lowHpCharacter = {
        ...validCharacterData,
        classes: [{ class: 'fighter', level: 10, hitDie: 10 }],
        hitPoints: { maximum: 8, current: 8, temporary: 0 }, // Very low HP for level 10
        abilityScores: { ...validCharacterData.abilityScores, constitution: 10 },
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(lowHpCharacter);
      expect(warnings.length).toBeGreaterThan(0);
      const hpWarning = warnings.find(w => w.field === 'hitPoints');
      expect(hpWarning).toBeDefined();
      expect(hpWarning?.message).toContain('Hit points seem low');
      expect(hpWarning?.severity).toBe('warning');
    });

    it('should warn about high armor class for low level', () => {
      const highAcCharacter = {
        ...validCharacterData,
        classes: [{ class: 'wizard', level: 2, hitDie: 6 }],
        armorClass: 22,
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(highAcCharacter);
      const acWarning = warnings.find(w => w.field === 'armorClass');
      expect(acWarning).toBeDefined();
      expect(acWarning?.message).toContain('seems high for character level');
    });

    it('should warn about very low armor class', () => {
      const lowAcCharacter = {
        ...validCharacterData,
        armorClass: 8,
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(lowAcCharacter);
      const acWarning = warnings.find(w => w.field === 'armorClass');
      expect(acWarning).toBeDefined();
      expect(acWarning?.message).toContain('seems very low');
      expect(acWarning?.severity).toBe('warning');
    });

    it('should warn about no high ability scores', () => {
      const lowStatsCharacter = {
        ...validCharacterData,
        abilityScores: {
          strength: 13,
          dexterity: 12,
          constitution: 13,
          intelligence: 11,
          wisdom: 12,
          charisma: 10,
        },
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(lowStatsCharacter);
      const statsWarning = warnings.find(w => w.field === 'abilityScores');
      expect(statsWarning).toBeDefined();
      expect(statsWarning?.message).toContain('No ability scores above 14');
    });

    it('should warn about multiclass without adequate stats', () => {
      const multiclassCharacter = {
        ...validCharacterData,
        classes: [
          { class: 'fighter', level: 3, hitDie: 10 },
          { class: 'rogue', level: 2, hitDie: 8 },
        ],
        abilityScores: {
          strength: 12,
          dexterity: 12,
          constitution: 12,
          intelligence: 10,
          wisdom: 10,
          charisma: 8,
        },
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(multiclassCharacter);
      const multiclassWarning = warnings.find(w => w.field === 'classes');
      expect(multiclassWarning).toBeDefined();
      expect(multiclassWarning?.message).toContain('Multiclassing typically requires');
    });

    it('should not warn about valid multiclass character', () => {
      const validMulticlassCharacter = {
        ...validCharacterData,
        classes: [
          { class: 'fighter', level: 3, hitDie: 10 },
          { class: 'rogue', level: 2, hitDie: 8 },
        ],
        abilityScores: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(validMulticlassCharacter);
      const multiclassWarning = warnings.find(w => w.field === 'classes');
      expect(multiclassWarning).toBeUndefined();
    });

    it('should provide helpful suggestions', () => {
      const problemCharacter = {
        ...validCharacterData,
        hitPoints: { maximum: 5, current: 5, temporary: 0 },
        armorClass: 8,
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(problemCharacter);

      warnings.forEach(warning => {
        expect(warning.suggestion).toBeDefined();
        expect(warning.suggestion!.length).toBeGreaterThan(0);
      });
    });

    it('should return no warnings for a well-built character', () => {
      const wellBuiltCharacter = {
        ...validCharacterData,
        classes: [{ class: 'fighter', level: 5, hitDie: 10 }],
        abilityScores: {
          strength: 16,
          dexterity: 14,
          constitution: 15,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
        hitPoints: { maximum: 45, current: 45, temporary: 0 },
        armorClass: 16,
      };

      const warnings = CharacterConsistencyChecker.checkConsistency(wellBuiltCharacter);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('Validation Messages', () => {
    it('should have comprehensive validation messages', () => {
      expect(CHARACTER_VALIDATION_MESSAGES.name.required).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.race.invalid).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.classes.duplicateClass).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.abilityScores.totalTooLow).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.hitPoints.currentTooHigh).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.armorClass.tooLow).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.equipment.duplicateNames).toBeDefined();
      expect(CHARACTER_VALIDATION_MESSAGES.spells.duplicateNames).toBeDefined();
    });

    it('should provide user-friendly error messages', () => {
      Object.values(CHARACTER_VALIDATION_MESSAGES).forEach(category => {
        Object.values(category).forEach(message => {
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
          // Messages should be descriptive, not just "Invalid"
          expect(message.length).toBeGreaterThan(10);
        });
      });
    });
  });
});