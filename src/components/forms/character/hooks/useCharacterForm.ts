'use client';

import { useState, useCallback } from 'react';
import { characterCreationSchema, CharacterType, CharacterClass, CharacterRace } from '@/lib/validations/character';
import { ZodError } from 'zod';

interface BasicInfoData {
  name: string;
  type: CharacterType;
  race: CharacterRace | 'custom';
  customRace: string;
}

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface ClassData {
  className: CharacterClass;
  level: number;
}

interface CombatStatsData {
  hitPoints: {
    maximum: number;
    current: number;
    temporary?: number;
  };
  armorClass: number;
  speed?: number;
  proficiencyBonus?: number;
}

interface FormData {
  basicInfo: BasicInfoData;
  abilityScores: AbilityScores;
  classes: ClassData[];
  combatStats: CombatStatsData;
}

interface FormErrors {
  basicInfo: Record<string, string>;
  abilityScores: Record<string, string>;
  classes: Record<string, string>;
  combatStats: Record<string, string>;
}

const initialFormData: FormData = {
  basicInfo: {
    name: '',
    type: 'pc',
    race: 'human',
    customRace: '',
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
    { className: 'fighter', level: 1 },
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

const initialErrors: FormErrors = {
  basicInfo: {},
  abilityScores: {},
  classes: {},
  combatStats: {},
};

export function useCharacterForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);

  const updateBasicInfo = useCallback((basicInfo: BasicInfoData) => {
    setFormData(prev => ({ ...prev, basicInfo }));

    // Clear related errors
    setErrors(prev => ({
      ...prev,
      basicInfo: {},
    }));
  }, []);

  const updateAbilityScores = useCallback((abilityScores: AbilityScores) => {
    setFormData(prev => ({ ...prev, abilityScores }));

    // Clear related errors
    setErrors(prev => ({
      ...prev,
      abilityScores: {},
    }));
  }, []);

  const updateClasses = useCallback((classes: ClassData[]) => {
    setFormData(prev => ({ ...prev, classes }));

    // Clear related errors
    setErrors(prev => ({
      ...prev,
      classes: {},
    }));
  }, []);

  const updateCombatStats = useCallback((combatStats: CombatStatsData) => {
    setFormData(prev => ({ ...prev, combatStats }));

    // Clear related errors
    setErrors(prev => ({
      ...prev,
      combatStats: {},
    }));
  }, []);

  const categorizeError = (path: string, message: string, newErrors: any) => {
    if (path.startsWith('name') || path.startsWith('type') || path.startsWith('race') || path.startsWith('customRace')) {
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

  const validateForm = useCallback((): boolean => {
    try {
      // Transform form data to match validation schema
      const characterData = {
        name: formData.basicInfo.name,
        type: formData.basicInfo.type,
        race: formData.basicInfo.race === 'custom' ? 'custom' : formData.basicInfo.race,
        customRace: formData.basicInfo.race === 'custom' ? formData.basicInfo.customRace : undefined,
        classes: formData.classes.map(cls => ({
          className: cls.className,
          level: cls.level,
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

      characterCreationSchema.parse(characterData);
      setErrors(initialErrors);
      return true;
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

        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const isFormValid = useCallback((): boolean => {
    // Check if all required fields are filled
    const hasBasicInfo = formData.basicInfo.name.trim() !== '' &&
                        formData.basicInfo.type !== undefined &&
                        formData.basicInfo.race.length > 0;

    const hasCustomRace = formData.basicInfo.race !== 'custom' ||
                         formData.basicInfo.customRace.trim() !== '';

    const hasValidAbilityScores = Object.values(formData.abilityScores).every(
      score => score >= 1 && score <= 30
    );

    const hasValidClasses = formData.classes.length > 0 &&
                           formData.classes.every(cls => cls.level >= 1 && cls.level <= 20);

    const hasValidCombatStats = formData.combatStats.hitPoints.maximum > 0 &&
                               formData.combatStats.armorClass > 0;

    // Check if there are no validation errors
    const hasNoErrors = Object.values(errors).every(errorSection =>
      Object.keys(errorSection).length === 0
    );

    return hasBasicInfo && hasCustomRace && hasValidAbilityScores &&
           hasValidClasses && hasValidCombatStats && hasNoErrors;
  }, [formData, errors]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors(initialErrors);
  }, []);

  return {
    formData,
    errors,
    updateBasicInfo,
    updateAbilityScores,
    updateClasses,
    updateCombatStats,
    validateForm,
    isFormValid: isFormValid(),
    resetForm,
  };
}