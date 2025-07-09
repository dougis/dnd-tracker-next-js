// Utility functions for character form validation and data transformation

import { characterCreationSchema, CharacterType, CharacterClass, CharacterRace, Size } from '@/lib/validations/character';
import { ZodError } from 'zod';

export interface BasicInfoData {
  name: string;
  type: CharacterType;
  race: CharacterRace | 'custom';
  customRace: string;
  size: Size;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface ClassData {
  class: CharacterClass;
  level: number;
  hitDie: number;
}

export interface CombatStatsData {
  hitPoints: {
    maximum: number;
    current: number;
    temporary?: number;
  };
  armorClass: number;
  speed?: number;
  proficiencyBonus?: number;
}

export interface FormData {
  basicInfo: BasicInfoData;
  abilityScores: AbilityScores;
  classes: ClassData[];
  combatStats: CombatStatsData;
}

export interface FormErrors {
  basicInfo: Record<string, string>;
  abilityScores: Record<string, string>;
  classes: Record<string, string>;
  combatStats: Record<string, string>;
}

export const initialFormData: FormData = {
  basicInfo: {
    name: '',
    type: 'pc',
    race: 'human',
    customRace: '',
    size: 'medium',
  },
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  classes: [
    { class: 'fighter', level: 1, hitDie: 10 },
  ],
  combatStats: {
    hitPoints: {
      maximum: 10,
      current: 10,
      temporary: 0,
    },
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
  },
};

export const initialErrors: FormErrors = {
  basicInfo: {},
  abilityScores: {},
  classes: {},
  combatStats: {},
};

/**
 * Categorize validation error by path
 */
export const categorizeError = (path: string, message: string, newErrors: FormErrors) => {
  if (path.startsWith('name') || path.startsWith('type') || path.startsWith('race') || path.startsWith('customRace') || path.startsWith('size')) {
    newErrors.basicInfo[path] = message;
  } else if (path.startsWith('abilityScores')) {
    const field = path.replace('abilityScores.', '');
    newErrors.abilityScores[field] = message;
  } else if (path.startsWith('classes')) {
    newErrors.classes[path] = message;
  } else if (path.startsWith('hitPoints') || path.startsWith('armorClass') || path.startsWith('speed') || path.startsWith('proficiencyBonus')) {
    newErrors.combatStats[path] = message;
  }
};

/**
 * Transform form data to character creation data for validation
 */
export const transformFormDataForValidation = (formData: FormData) => {
  return {
    name: formData.basicInfo.name,
    type: formData.basicInfo.type,
    race: formData.basicInfo.race === 'custom' ? 'custom' : formData.basicInfo.race,
    customRace: formData.basicInfo.race === 'custom' ? formData.basicInfo.customRace : undefined,
    size: formData.basicInfo.size,
    classes: formData.classes.map(cls => ({
      class: cls.class,
      level: cls.level,
      hitDie: cls.hitDie,
    })),
    abilityScores: formData.abilityScores,
    hitPoints: {
      maximum: formData.combatStats.hitPoints.maximum,
      current: formData.combatStats.hitPoints.current,
      temporary: formData.combatStats.hitPoints.temporary || 0,
    },
    armorClass: formData.combatStats.armorClass,
    speed: formData.combatStats.speed || 30,
    proficiencyBonus: formData.combatStats.proficiencyBonus || 2,
  };
};

/**
 * Validate form data using Zod schema
 */
export const validateFormData = (formData: FormData): { isValid: boolean; errors: FormErrors } => {
  try {
    const characterData = transformFormDataForValidation(formData);
    characterCreationSchema.parse(characterData);
    return { isValid: true, errors: initialErrors };
  } catch (error) {
    if (error instanceof ZodError) {
      const newErrors: FormErrors = {
        basicInfo: {},
        abilityScores: {},
        classes: {},
        combatStats: {},
      };

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        categorizeError(path, err.message, newErrors);
      });

      return { isValid: false, errors: newErrors };
    }
    return { isValid: false, errors: initialErrors };
  }
};

/**
 * Check if basic info is complete
 */
export const hasCompleteBasicInfo = (basicInfo: BasicInfoData): boolean => {
  return !!(basicInfo.name.trim() && basicInfo.type && basicInfo.race.length > 0);
};

/**
 * Check if custom race is valid when required
 */
export const hasValidCustomRace = (basicInfo: BasicInfoData): boolean => {
  return basicInfo.race !== 'custom' || !!basicInfo.customRace.trim();
};

/**
 * Check if ability scores are in valid range
 */
export const hasValidAbilityScores = (abilityScores: AbilityScores): boolean => {
  return Object.values(abilityScores).every(score => score >= 1 && score <= 30);
};

/**
 * Check if classes are valid
 */
export const hasValidClasses = (classes: ClassData[]): boolean => {
  return classes.length > 0 && classes.every(cls =>
    cls.level >= 1 && cls.level <= 20 && cls.hitDie >= 4 && cls.hitDie <= 12
  );
};

/**
 * Check if combat stats are valid
 */
export const hasValidCombatStats = (combatStats: CombatStatsData): boolean => {
  return combatStats.hitPoints.maximum > 0 && combatStats.armorClass > 0;
};

/**
 * Check overall form validity
 */
export const isFormValid = (formData: FormData, errors: FormErrors): boolean => {
  const hasBasicInfo = hasCompleteBasicInfo(formData.basicInfo);
  const hasCustomRace = hasValidCustomRace(formData.basicInfo);
  const hasValidAbilities = hasValidAbilityScores(formData.abilityScores);
  const hasValidClassData = hasValidClasses(formData.classes);
  const hasValidCombat = hasValidCombatStats(formData.combatStats);

  // Check if there are no validation errors
  const hasNoErrors = Object.values(errors).every(errorSection =>
    Object.keys(errorSection).length === 0
  );

  return hasBasicInfo && hasCustomRace && hasValidAbilities &&
         hasValidClassData && hasValidCombat && hasNoErrors;
};