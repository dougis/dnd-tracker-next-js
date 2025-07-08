/**
 * Base error class for damage calculation service errors
 */
export class DamageCalculationServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'DAMAGE_CALCULATION_ERROR', statusCode: number = 400) {
    super(message);
    this.name = 'DamageCalculationServiceError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, DamageCalculationServiceError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 */
export class InvalidDamageInputError extends DamageCalculationServiceError {
  constructor(field: string, value: unknown, constraint: string) {
    super(
      `Invalid ${field}: ${value}. ${constraint}`,
      'INVALID_DAMAGE_INPUT',
      400
    );
    this.name = 'InvalidDamageInputError';
    Object.setPrototypeOf(this, InvalidDamageInputError.prototype);
  }
}

/**
 * Error thrown when a damage preset is not found
 */
export class PresetNotFoundError extends DamageCalculationServiceError {
  constructor(presetName: string) {
    super(
      `Damage preset '${presetName}' not found`,
      'PRESET_NOT_FOUND',
      404
    );
    this.name = 'PresetNotFoundError';
    Object.setPrototypeOf(this, PresetNotFoundError.prototype);
  }
}

/**
 * Error thrown when dice rolling fails
 */
export class DiceRollError extends DamageCalculationServiceError {
  constructor(message: string) {
    super(
      `Dice roll error: ${message}`,
      'DICE_ROLL_ERROR',
      500
    );
    this.name = 'DiceRollError';
    Object.setPrototypeOf(this, DiceRollError.prototype);
  }
}

/**
 * Error thrown when damage calculation exceeds limits
 */
export class DamageCalculationLimitError extends DamageCalculationServiceError {
  constructor(limit: string, value: number, maximum: number) {
    super(
      `${limit} exceeds maximum allowed value. Got ${value}, maximum is ${maximum}`,
      'DAMAGE_CALCULATION_LIMIT',
      400
    );
    this.name = 'DamageCalculationLimitError';
    Object.setPrototypeOf(this, DamageCalculationLimitError.prototype);
  }
}

/**
 * Type guard to check if an error is a DamageCalculationServiceError
 */
export function isDamageCalculationServiceError(error: unknown): error is DamageCalculationServiceError {
  return error instanceof DamageCalculationServiceError;
}

/**
 * Constants for validation limits
 */
export const DAMAGE_CALCULATION_LIMITS = {
  MAX_DICE_COUNT: 100,
  MAX_MODIFIER: 999,
  MIN_MODIFIER: -999,
  MAX_TARGETS: 50
} as const;