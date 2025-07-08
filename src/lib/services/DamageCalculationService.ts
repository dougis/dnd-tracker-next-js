import {
  calculateDamage,
  calculateDamageWithResistance,
  calculateCriticalDamage,
  distributeDamageToMultipleTargets
} from '../utils/dice/damage-calculation';

import {
  DamageCalculationInput,
  DamageCalculationResult,
  DamageWithResistanceResult,
  DamageDistributionTarget,
  TargetDamageResult,
  DamageDistributionMethod,
  DamagePreset,
  DamageStatistics,
  DamageType,
  ResistanceType,
  COMMON_DAMAGE_PRESETS,
  DICE_VALUES
} from '../utils/dice/damage-types';

import {
  DamageCalculationServiceError,
  InvalidDamageInputError,
  PresetNotFoundError,
  DamageCalculationLimitError,
  DAMAGE_CALCULATION_LIMITS
} from './DamageCalculationServiceErrors';

/**
 * Service class for damage calculation operations
 * Provides validation, error handling, and business logic for damage calculations
 */
export class DamageCalculationService {
  private readonly presets: DamagePreset[];

  constructor() {
    this.presets = [...COMMON_DAMAGE_PRESETS];
  }

  /**
   * Calculate basic damage with validation
   */
  public calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
    this.validateDamageInput(input);
    
    try {
      return calculateDamage(input);
    } catch (error) {
      throw new DamageCalculationServiceError(
        `Failed to calculate damage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate damage with resistance applied
   */
  public calculateDamageWithResistance(
    baseDamage: DamageCalculationResult,
    resistanceType: ResistanceType
  ): DamageWithResistanceResult {
    this.validateBaseDamage(baseDamage);
    
    try {
      return calculateDamageWithResistance(baseDamage, resistanceType);
    } catch (error) {
      throw new DamageCalculationServiceError(
        `Failed to apply resistance: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate critical damage with validation
   */
  public calculateCriticalDamage(input: DamageCalculationInput): DamageCalculationResult {
    this.validateDamageInput(input);
    
    try {
      return calculateCriticalDamage(input);
    } catch (error) {
      throw new DamageCalculationServiceError(
        `Failed to calculate critical damage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Distribute damage to multiple targets
   */
  public distributeDamageToTargets(
    baseDamage: DamageCalculationResult,
    targets: DamageDistributionTarget[],
    distributionMethod: DamageDistributionMethod = 'equal'
  ): TargetDamageResult[] {
    this.validateBaseDamage(baseDamage);
    this.validateTargets(targets);
    
    try {
      return distributeDamageToMultipleTargets(baseDamage, targets, distributionMethod);
    } catch (error) {
      throw new DamageCalculationServiceError(
        `Failed to distribute damage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get damage preset by name
   */
  public getPresetByName(name: string): DamagePreset | undefined {
    return this.presets.find(preset => preset.id === name);
  }

  /**
   * Get all available damage presets
   */
  public getAllPresets(): DamagePreset[] {
    return [...this.presets];
  }

  /**
   * Get presets filtered by tag
   */
  public getPresetsByTag(tag: string): DamagePreset[] {
    return this.presets.filter(preset => preset.tags.includes(tag));
  }

  /**
   * Calculate damage using a preset
   */
  public calculateDamageFromPreset(
    presetName: string,
    modifierOverride?: number
  ): DamageCalculationResult {
    const preset = this.getPresetByName(presetName);
    if (!preset) {
      throw new PresetNotFoundError(presetName);
    }

    const input: DamageCalculationInput = {
      diceCount: preset.diceCount,
      diceType: preset.diceType,
      modifier: modifierOverride ?? preset.modifier,
      damageType: preset.damageType
    };

    return this.calculateDamage(input);
  }

  /**
   * Calculate damage statistics (min, max, average)
   */
  public getDamageStatistics(input: DamageCalculationInput): DamageStatistics {
    this.validateDamageInput(input);

    const diceValue = DICE_VALUES[input.diceType];
    const minimum = Math.max(0, input.diceCount * 1 + input.modifier);
    const maximum = Math.max(0, input.diceCount * diceValue + input.modifier);
    const averageRoll = (1 + diceValue) / 2;
    const average = Math.max(0, input.diceCount * averageRoll + input.modifier);

    return {
      minimum,
      maximum,
      average,
      expectedDamage: average
    };
  }

  /**
   * Validate damage calculation input
   */
  private validateDamageInput(input: DamageCalculationInput): void {
    if (input.diceCount < 0) {
      throw new InvalidDamageInputError('diceCount', input.diceCount, 'Must be non-negative');
    }

    if (input.diceCount > DAMAGE_CALCULATION_LIMITS.MAX_DICE_COUNT) {
      throw new DamageCalculationLimitError('Dice count', input.diceCount, DAMAGE_CALCULATION_LIMITS.MAX_DICE_COUNT);
    }

    if (input.modifier < DAMAGE_CALCULATION_LIMITS.MIN_MODIFIER) {
      throw new DamageCalculationLimitError('Modifier', input.modifier, DAMAGE_CALCULATION_LIMITS.MIN_MODIFIER);
    }

    if (input.modifier > DAMAGE_CALCULATION_LIMITS.MAX_MODIFIER) {
      throw new DamageCalculationLimitError('Modifier', input.modifier, DAMAGE_CALCULATION_LIMITS.MAX_MODIFIER);
    }

    if (!DICE_VALUES[input.diceType]) {
      throw new InvalidDamageInputError('diceType', input.diceType, 'Must be a valid dice type');
    }
  }

  /**
   * Validate base damage result
   */
  private validateBaseDamage(baseDamage: DamageCalculationResult): void {
    if (!baseDamage) {
      throw new InvalidDamageInputError('baseDamage', baseDamage, 'Cannot be null or undefined');
    }

    if (typeof baseDamage.totalDamage !== 'number' || baseDamage.totalDamage < 0) {
      throw new InvalidDamageInputError('totalDamage', baseDamage.totalDamage, 'Must be a non-negative number');
    }

    if (!Array.isArray(baseDamage.diceRolls)) {
      throw new InvalidDamageInputError('diceRolls', baseDamage.diceRolls, 'Must be an array');
    }
  }

  /**
   * Validate targets for damage distribution
   */
  private validateTargets(targets: DamageDistributionTarget[]): void {
    if (!Array.isArray(targets)) {
      throw new InvalidDamageInputError('targets', targets, 'Must be an array');
    }

    if (targets.length === 0) {
      throw new InvalidDamageInputError('targets', targets.length, 'Must have at least one target');
    }

    if (targets.length > DAMAGE_CALCULATION_LIMITS.MAX_TARGETS) {
      throw new DamageCalculationLimitError('Target count', targets.length, DAMAGE_CALCULATION_LIMITS.MAX_TARGETS);
    }

    targets.forEach((target, index) => {
      if (!target.id) {
        throw new InvalidDamageInputError(`targets[${index}].id`, target.id, 'Target ID is required');
      }

      if (!target.name) {
        throw new InvalidDamageInputError(`targets[${index}].name`, target.name, 'Target name is required');
      }

      if (!target.resistanceType) {
        throw new InvalidDamageInputError(`targets[${index}].resistanceType`, target.resistanceType, 'Resistance type is required');
      }
    });
  }
}