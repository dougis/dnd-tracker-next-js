import { z } from 'zod';
import {
  characterCreationSchema,
  characterUpdateSchema,
  characterClassSchema,
  characterRaceSchema,
  abilityScoresSchema,
  equipmentItemSchema,
  spellSchema,
  type CharacterCreation,
  type CharacterUpdate,
  type AbilityScores,
} from './character';
import {
  ValidationError,
  safeValidate,
  type ValidationResult,
} from './base';

/**
 * Enhanced character validation with advanced business rules and validation feedback
 * Builds upon the existing character validation schemas to provide:
 * - More granular validation rules
 * - Enhanced error messaging
 * - Business rule validation
 * - Cross-field validation
 * - Data consistency checks
 */

// Enhanced validation error messages for better user guidance
export const CHARACTER_VALIDATION_MESSAGES = {
  name: {
    required: 'Character name is required',
    tooShort: 'Character name must be at least 1 character long',
    tooLong: 'Character name cannot exceed 100 characters',
    invalid: 'Character name contains invalid characters',
  },
  race: {
    required: 'Character race is required',
    invalid: 'Please select a valid race from the list',
    customRequired: 'Custom race name is required when "custom" is selected',
  },
  classes: {
    required: 'At least one class is required',
    tooMany: 'Maximum of 3 classes allowed for multiclassing',
    duplicateClass: 'Cannot have duplicate classes in multiclass build',
    invalidLevel: 'Class level must be between 1 and 20',
    invalidHitDie: 'Hit die must be between 4 and 12',
  },
  abilityScores: {
    required: 'All ability scores are required',
    tooLow: 'Ability scores cannot be lower than 1',
    tooHigh: 'Ability scores cannot be higher than 30',
    totalTooLow: 'Total ability score points seem unusually low (consider point buy or standard array)',
    totalTooHigh: 'Total ability score points seem unusually high (consider point buy or standard array)',
  },
  hitPoints: {
    required: 'Hit points are required',
    currentTooLow: 'Current hit points cannot be negative',
    currentTooHigh: 'Current hit points cannot exceed maximum',
    maximumTooLow: 'Maximum hit points must be at least 1',
    temporaryNegative: 'Temporary hit points cannot be negative',
  },
  armorClass: {
    required: 'Armor class is required',
    tooLow: 'Armor class cannot be lower than 1',
    tooHigh: 'Armor class cannot be higher than 30',
  },
  equipment: {
    tooMany: 'Maximum of 100 equipment items allowed',
    duplicateNames: 'Equipment items with duplicate names detected',
    invalidWeight: 'Equipment weight cannot be negative',
    invalidValue: 'Equipment value cannot be negative',
  },
  spells: {
    tooMany: 'Maximum of 200 spells allowed',
    invalidLevel: 'Spell level must be between 0 (cantrip) and 9',
    duplicateNames: 'Spells with duplicate names detected',
  },
} as const;

// Enhanced ability score validation with point buy checking
export const enhancedAbilityScoresSchema = abilityScoresSchema.refine(
  (scores: AbilityScores) => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return total >= 36; // Minimum reasonable total (6 x 6)
  },
  {
    message: CHARACTER_VALIDATION_MESSAGES.abilityScores.totalTooLow,
    path: ['total'],
  }
).refine(
  (scores: AbilityScores) => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return total <= 120; // Maximum reasonable total (6 x 20)
  },
  {
    message: CHARACTER_VALIDATION_MESSAGES.abilityScores.totalTooHigh,
    path: ['total'],
  }
);

// Enhanced character class validation with multiclass rules
export const enhancedCharacterClassesSchema = z.array(
  z.object({
    class: characterClassSchema,
    level: z.number().int().min(1).max(20),
    hitDie: z.number().int().min(4).max(12),
    subclass: z.string().max(50).optional(),
  })
).min(1, CHARACTER_VALIDATION_MESSAGES.classes.required)
  .max(3, CHARACTER_VALIDATION_MESSAGES.classes.tooMany)
  .refine(
    (classes) => {
      // Check for duplicate classes
      const classNames = classes.map(cls => cls.class);
      const uniqueClasses = new Set(classNames);
      return uniqueClasses.size === classNames.length;
    },
    {
      message: CHARACTER_VALIDATION_MESSAGES.classes.duplicateClass,
      path: ['classes'],
    }
  )
  .refine(
    (classes) => {
      // Check total level doesn't exceed 20
      const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
      return totalLevel <= 20;
    },
    {
      message: 'Total character level cannot exceed 20',
      path: ['totalLevel'],
    }
  );

// Enhanced equipment validation with duplicate checking
export const enhancedEquipmentSchema = z.array(equipmentItemSchema)
  .max(100, CHARACTER_VALIDATION_MESSAGES.equipment.tooMany)
  .refine(
    (equipment) => {
      // Check for duplicate equipment names
      const names = equipment.map(item => item.name.toLowerCase());
      const uniqueNames = new Set(names);
      return uniqueNames.size === names.length;
    },
    {
      message: CHARACTER_VALIDATION_MESSAGES.equipment.duplicateNames,
      path: ['equipment'],
    }
  );

// Enhanced spell validation with duplicate checking
export const enhancedSpellSchema = z.array(spellSchema)
  .max(200, CHARACTER_VALIDATION_MESSAGES.spells.tooMany)
  .refine(
    (spells) => {
      // Check for duplicate spell names
      const names = spells.map(spell => spell.name.toLowerCase());
      const uniqueNames = new Set(names);
      return uniqueNames.size === names.length;
    },
    {
      message: CHARACTER_VALIDATION_MESSAGES.spells.duplicateNames,
      path: ['spells'],
    }
  );

// Enhanced hit points validation with logical checks
export const enhancedHitPointsSchema = z.object({
  maximum: z.number().int().min(1, CHARACTER_VALIDATION_MESSAGES.hitPoints.maximumTooLow),
  current: z.number().int().min(0, CHARACTER_VALIDATION_MESSAGES.hitPoints.currentTooLow),
  temporary: z.number().int().min(0, CHARACTER_VALIDATION_MESSAGES.hitPoints.temporaryNegative).default(0),
}).refine(
  (hp) => hp.current <= hp.maximum,
  {
    message: CHARACTER_VALIDATION_MESSAGES.hitPoints.currentTooHigh,
    path: ['current'],
  }
);

// Enhanced character creation schema with cross-field validation
export const enhancedCharacterCreationSchema = characterCreationSchema.extend({
  abilityScores: enhancedAbilityScoresSchema,
  classes: enhancedCharacterClassesSchema,
  hitPoints: enhancedHitPointsSchema,
  equipment: enhancedEquipmentSchema.optional().default([]),
  spells: enhancedSpellSchema.optional().default([]),
}).refine(
  (character) => {
    // Validate custom race name when race is "custom"
    if (character.race === 'custom' && !character.customRace?.trim()) {
      return false;
    }
    return true;
  },
  {
    message: CHARACTER_VALIDATION_MESSAGES.race.customRequired,
    path: ['customRace'],
  }
);

// Enhanced update schema that allows partial updates but maintains validation rules
export const enhancedCharacterUpdateSchema = characterUpdateSchema;

/**
 * Character consistency check rules
 */
export interface ConsistencyWarning {
  field: string;
  message: string;
  severity: 'warning' | 'info';
  suggestion?: string;
}

export class CharacterConsistencyChecker {
  static checkConsistency(character: CharacterCreation): ConsistencyWarning[] {
    const warnings: ConsistencyWarning[] = [];

    // Check if hit points are reasonable for level and constitution
    const totalLevel = character.classes.reduce((sum, cls) => sum + cls.level, 0);
    const constitutionModifier = Math.floor((character.abilityScores.constitution - 10) / 2);
    const averageHitDie = character.classes.reduce((sum, cls) => sum + cls.hitDie, 0) / character.classes.length;
    const expectedMinHP = totalLevel + (constitutionModifier * totalLevel);
    const expectedMaxHP = (averageHitDie * totalLevel) + (constitutionModifier * totalLevel);

    if (character.hitPoints.maximum < expectedMinHP) {
      warnings.push({
        field: 'hitPoints',
        message: `Hit points seem low for level ${totalLevel} character`,
        severity: 'warning',
        suggestion: `Consider at least ${expectedMinHP} HP based on level and Constitution modifier`,
      });
    }

    if (character.hitPoints.maximum > expectedMaxHP + 10) {
      warnings.push({
        field: 'hitPoints',
        message: `Hit points seem unusually high for level ${totalLevel} character`,
        severity: 'info',
        suggestion: `Typical range would be ${expectedMinHP}-${Math.round(expectedMaxHP)} HP`,
      });
    }

    // Check if armor class is reasonable for character type and level
    if (character.armorClass < 10) {
      warnings.push({
        field: 'armorClass',
        message: 'Armor class seems very low',
        severity: 'warning',
        suggestion: 'Consider armor or natural armor bonuses',
      });
    }

    if (character.armorClass > 20 && totalLevel < 10) {
      warnings.push({
        field: 'armorClass',
        message: 'Armor class seems high for character level',
        severity: 'info',
        suggestion: 'Verify armor calculations and magical bonuses',
      });
    }

    // Check ability score distribution
    const scores = Object.values(character.abilityScores);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    if (maxScore < 14) {
      warnings.push({
        field: 'abilityScores',
        message: 'No ability scores above 14 - character may struggle with primary abilities',
        severity: 'warning',
        suggestion: 'Consider higher scores in primary class abilities',
      });
    }

    if (minScore < 8 && scores.filter(s => s < 10).length > 2) {
      warnings.push({
        field: 'abilityScores',
        message: 'Multiple very low ability scores detected',
        severity: 'info',
        suggestion: 'Low scores create roleplay opportunities but may impact effectiveness',
      });
    }

    // Check multiclass prerequisites (simplified)
    if (character.classes.length > 1) {
      const hasMulticlassStats = scores.some(score => score >= 13);
      if (!hasMulticlassStats) {
        warnings.push({
          field: 'classes',
          message: 'Multiclassing typically requires at least one ability score of 13+',
          severity: 'warning',
          suggestion: 'Check multiclass prerequisites for your chosen classes',
        });
      }
    }

    return warnings;
  }
}

/**
 * Real-time field validation for form components
 */
export class RealtimeValidator {
  static validateFieldValue(fieldName: string, value: any, fullCharacter?: Partial<CharacterCreation>): ValidationError | null {
    try {
      switch (fieldName) {
        case 'name':
          const nameResult = z.string().min(1).max(100).safeParse(value);
          if (!nameResult.success) {
            return new ValidationError(CHARACTER_VALIDATION_MESSAGES.name.tooShort, 'name');
          }
          break;

        case 'race':
          const raceResult = characterRaceSchema.safeParse(value);
          if (!raceResult.success) {
            return new ValidationError(CHARACTER_VALIDATION_MESSAGES.race.invalid, 'race');
          }
          break;

        case 'customRace':
          if (fullCharacter?.race === 'custom' && (!value || !value.trim())) {
            return new ValidationError(CHARACTER_VALIDATION_MESSAGES.race.customRequired, 'customRace');
          }
          break;

        case 'hitPoints.current':
          if (fullCharacter?.hitPoints?.maximum && value > fullCharacter.hitPoints.maximum) {
            return new ValidationError(CHARACTER_VALIDATION_MESSAGES.hitPoints.currentTooHigh, 'hitPoints.current');
          }
          if (value < 0) {
            return new ValidationError(CHARACTER_VALIDATION_MESSAGES.hitPoints.currentTooLow, 'hitPoints.current');
          }
          break;

        case 'armorClass':
          if (value < 1 || value > 30) {
            return new ValidationError(
              value < 1 ? CHARACTER_VALIDATION_MESSAGES.armorClass.tooLow : CHARACTER_VALIDATION_MESSAGES.armorClass.tooHigh,
              'armorClass'
            );
          }
          break;

        default:
          // Generic validation for ability scores
          if (fieldName.includes('abilityScores.')) {
            if (value < 1 || value > 30) {
              return new ValidationError(
                value < 1 ? CHARACTER_VALIDATION_MESSAGES.abilityScores.tooLow : CHARACTER_VALIDATION_MESSAGES.abilityScores.tooHigh,
                fieldName
              );
            }
          }
          break;
      }

      return null;
    } catch (error) {
      return new ValidationError('Validation error occurred', fieldName);
    }
  }

  static validateCharacterData(data: Partial<CharacterCreation>): ValidationResult<CharacterCreation> {
    // Use the existing validation from CharacterValidationUtils which works correctly
    try {
      const validationResult = characterCreationSchema.safeParse(data);
      if (validationResult.success) {
        return {
          success: true,
          data: validationResult.data,
        };
      } else {
        return {
          success: false,
          errors: validationResult.error.errors.map(err => new ValidationError(err.message, err.path.join('.'))),
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [new ValidationError('Validation failed', 'general')],
      };
    }
  }

  static validateUpdateData(data: Partial<CharacterUpdate>): ValidationResult<CharacterUpdate> {
    // Temporary implementation - to be properly typed in follow-up
    const result = safeValidate(characterUpdateSchema, data);
    return result as ValidationResult<CharacterUpdate>;
  }
}

// Type exports
export type EnhancedCharacterCreation = z.infer<typeof enhancedCharacterCreationSchema>;
export type EnhancedCharacterUpdate = z.infer<typeof enhancedCharacterUpdateSchema>;
// Note: ConsistencyWarning type is already exported above