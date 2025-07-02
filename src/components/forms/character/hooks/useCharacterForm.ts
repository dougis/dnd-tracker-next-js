'use client';

import { useState, useCallback } from 'react';
import {
  BasicInfoData,
  AbilityScores,
  ClassData,
  CombatStatsData,
  FormData,
  FormErrors,
  initialFormData,
  initialErrors,
  validateFormData,
  isFormValid
} from './character-form-utils';

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

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateFormData(formData);
    setErrors(validationErrors);
    return isValid;
  }, [formData]);

  const formValid = useCallback((): boolean => {
    return isFormValid(formData, errors);
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
    isFormValid: formValid(),
    resetForm,
  };
}