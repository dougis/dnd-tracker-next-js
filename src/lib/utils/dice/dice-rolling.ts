import { DiceType, DiceRollResult, DICE_VALUES } from './damage-types';

/**
 * Roll a single die of the specified type
 */
export function rollDice(diceType: DiceType): number {
  const sides = DICE_VALUES[diceType];
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice of the same type
 */
export function rollMultipleDice(count: number, diceType: DiceType): number[] {
  if (count <= 0) {
    return [];
  }

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDice(diceType));
  }

  return rolls;
}

/**
 * Roll damage with specified dice count, type, and modifier
 */
export function rollDamage(
  diceCount: number,
  diceType: DiceType,
  modifier: number = 0
): DiceRollResult {
  const rolls = rollMultipleDice(diceCount, diceType);
  const rollsTotal = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = Math.max(0, rollsTotal + modifier);

  return {
    rolls,
    total,
    modifier
  };
}

/**
 * Roll critical damage (doubles the dice, not the modifier)
 */
export function rollCriticalDamage(
  diceCount: number,
  diceType: DiceType,
  modifier: number = 0
): DiceRollResult {
  const criticalDiceCount = diceCount * 2;
  const result = rollDamage(criticalDiceCount, diceType, modifier);

  return {
    ...result,
    isCritical: true
  };
}

export type { DiceType, DiceRollResult };