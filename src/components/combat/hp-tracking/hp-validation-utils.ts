export interface HPValidationError {
  currentHitPoints?: string;
  maxHitPoints?: string;
  temporaryHitPoints?: string;
  damage?: string;
  healing?: string;
}

export interface HPValues {
  currentHitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints: number;
}

export const HP_VALIDATION_MESSAGES = {
  currentHPMin: 'Current HP must be at least 0',
  maxHPMin: 'Maximum HP must be at least 1',
  tempHPMin: 'Temporary HP must be at least 0',
  damageMin: 'Damage must be at least 0',
  healingMin: 'Healing must be at least 0',
  invalidNumber: 'Please enter a valid number',
} as const;

export function parseAndValidateNumber(
  value: string | number,
  min: number = 0
): { value: number; isValid: boolean; error?: string } {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(parsed)) {
    return {
      value: min,
      isValid: false,
      error: HP_VALIDATION_MESSAGES.invalidNumber,
    };
  }

  if (parsed < min) {
    return {
      value: min,
      isValid: false,
      error: min === 0 ? HP_VALIDATION_MESSAGES.currentHPMin : HP_VALIDATION_MESSAGES.maxHPMin,
    };
  }

  return { value: parsed, isValid: true };
}

export function validateHPValues(
  currentHP: number,
  maxHP: number,
  tempHP: number
): HPValidationError {
  const errors: HPValidationError = {};

  if (currentHP < 0) {
    errors.currentHitPoints = HP_VALIDATION_MESSAGES.currentHPMin;
  }

  if (maxHP < 1) {
    errors.maxHitPoints = HP_VALIDATION_MESSAGES.maxHPMin;
  }

  if (tempHP < 0) {
    errors.temporaryHitPoints = HP_VALIDATION_MESSAGES.tempHPMin;
  }

  return errors;
}

export function validateDamageInput(damage: string): { isValid: boolean; error?: string; parsed: number } {
  const { value, isValid, error } = parseAndValidateNumber(damage, 0);
  return {
    isValid,
    error: isValid ? undefined : (error || HP_VALIDATION_MESSAGES.damageMin),
    parsed: value,
  };
}

export function validateHealingInput(healing: string): { isValid: boolean; error?: string; parsed: number } {
  const { value, isValid, error } = parseAndValidateNumber(healing, 0);
  return {
    isValid,
    error: isValid ? undefined : (error || HP_VALIDATION_MESSAGES.healingMin),
    parsed: value,
  };
}

export function hasValidationErrors(errors: HPValidationError): boolean {
  return Object.values(errors).some(error => error !== undefined);
}