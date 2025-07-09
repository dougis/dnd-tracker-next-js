import { rollMultipleDice } from './dice-rolling';
import {
  DamageType,
  ResistanceType,
  DiceType,
  DamageCalculationInput,
  DamageCalculationResult,
  DamageWithResistanceResult,
  DamageDistributionTarget,
  TargetDamageResult,
  DamageDistributionMethod,
  RESISTANCE_MULTIPLIERS
} from './damage-types';

/**
 * Calculate basic damage with dice rolls and modifier
 */
export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
  const { diceCount, diceType, modifier, damageType } = input;

  const diceRolls = rollMultipleDice(diceCount, diceType);
  const rollsTotal = diceRolls.reduce((sum, roll) => sum + roll, 0);
  const totalDamage = Math.max(0, rollsTotal + modifier);

  return {
    totalDamage,
    diceRolls,
    modifier,
    damageType
  };
}

/**
 * Calculate damage with resistance/vulnerability/immunity applied
 */
export function calculateDamageWithResistance(
  baseDamage: DamageCalculationResult,
  resistanceType: ResistanceType
): DamageWithResistanceResult {
  const multiplier = RESISTANCE_MULTIPLIERS[resistanceType];
  const finalDamage = Math.floor(baseDamage.totalDamage * multiplier);

  return {
    ...baseDamage,
    finalDamage,
    resistanceApplied: resistanceType,
    originalDamage: baseDamage.totalDamage
  };
}

/**
 * Calculate critical damage (doubles dice rolls, not modifier)
 */
export function calculateCriticalDamage(input: DamageCalculationInput): DamageCalculationResult {
  const { diceCount, diceType, modifier, damageType } = input;

  // Roll normal dice
  const normalRolls = rollMultipleDice(diceCount, diceType);
  // Roll additional dice for critical (double the dice)
  const criticalRolls = rollMultipleDice(diceCount, diceType);

  const allRolls = [...normalRolls, ...criticalRolls];
  const rollsTotal = allRolls.reduce((sum, roll) => sum + roll, 0);
  const totalDamage = Math.max(0, rollsTotal + modifier);

  return {
    totalDamage,
    diceRolls: allRolls,
    modifier,
    damageType,
    isCritical: true
  };
}

/**
 * Distribute damage to multiple targets with their individual resistances
 */
export function distributeDamageToMultipleTargets(
  baseDamage: DamageCalculationResult,
  targets: DamageDistributionTarget[],
  distributionMethod: DamageDistributionMethod
): TargetDamageResult[] {
  return targets.map(target => {
    let damageForTarget = { ...baseDamage };

    // Apply distribution method
    if (distributionMethod === 'half') {
      damageForTarget = {
        ...damageForTarget,
        totalDamage: Math.floor(baseDamage.totalDamage / 2)
      };
    }
    // 'equal' and 'custom' use the full damage

    // Apply target's resistance
    const resistanceResult = calculateDamageWithResistance(
      damageForTarget,
      target.resistanceType
    );

    return {
      ...resistanceResult,
      targetId: target.id,
      targetName: target.name
    };
  });
}

// Re-export types for convenience
export type {
  DamageType,
  ResistanceType,
  DiceType,
  DamageCalculationInput,
  DamageCalculationResult,
  DamageWithResistanceResult,
  DamageDistributionTarget,
  TargetDamageResult,
  DamageDistributionMethod
};