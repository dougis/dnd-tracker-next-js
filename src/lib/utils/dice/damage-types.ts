/**
 * D&D 5e damage types
 */
export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder';

/**
 * Resistance types for damage calculation
 */
export type ResistanceType =
  | 'normal'     // No resistance or vulnerability
  | 'resistant'  // Half damage
  | 'vulnerable' // Double damage
  | 'immune';    // No damage

/**
 * Dice types used in D&D
 */
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

/**
 * Distribution methods for multi-target damage
 */
export type DamageDistributionMethod = 'equal' | 'half' | 'custom';

/**
 * Input for basic damage calculation
 */
export interface DamageCalculationInput {
  diceCount: number;
  diceType: DiceType;
  modifier: number;
  damageType: DamageType;
}

/**
 * Result of damage calculation
 */
export interface DamageCalculationResult {
  totalDamage: number;
  diceRolls: number[];
  modifier: number;
  damageType: DamageType;
  isCritical?: boolean;
}

/**
 * Result of damage calculation with resistance applied
 */
export interface DamageWithResistanceResult extends DamageCalculationResult {
  finalDamage: number;
  resistanceApplied: ResistanceType;
  originalDamage: number;
}

/**
 * Target for multi-target damage distribution
 */
export interface DamageDistributionTarget {
  id: string;
  name: string;
  resistanceType: ResistanceType;
}

/**
 * Result for individual target in multi-target damage
 */
export interface TargetDamageResult extends DamageWithResistanceResult {
  targetId: string;
  targetName: string;
}

/**
 * Preset damage template
 */
export interface DamagePreset {
  id: string;
  name: string;
  description: string;
  diceCount: number;
  diceType: DiceType;
  modifier: number;
  damageType: DamageType;
  tags: string[];
}

/**
 * Damage calculation options
 */
export interface DamageCalculationOptions {
  allowNegativeDamage?: boolean;
  minimumDamage?: number;
  maximumDamage?: number;
  roundHalfDamage?: 'up' | 'down' | 'nearest';
}

/**
 * Dice roll result
 */
export interface DiceRollResult {
  rolls: number[];
  total: number;
  modifier: number;
  isCritical?: boolean;
}

/**
 * Statistics for damage calculation
 */
export interface DamageStatistics {
  minimum: number;
  maximum: number;
  average: number;
  expectedDamage: number;
}

/**
 * Damage type categories for organization
 */
export const DAMAGE_TYPE_CATEGORIES = {
  physical: ['bludgeoning', 'piercing', 'slashing'] as DamageType[],
  elemental: ['acid', 'cold', 'fire', 'lightning', 'thunder'] as DamageType[],
  energy: ['force', 'necrotic', 'radiant'] as DamageType[],
  mental: ['psychic'] as DamageType[],
  toxic: ['poison'] as DamageType[]
} as const;

/**
 * Common damage presets for quick access
 */
export const COMMON_DAMAGE_PRESETS: DamagePreset[] = [
  {
    id: 'shortsword',
    name: 'Shortsword',
    description: 'Standard shortsword attack',
    diceCount: 1,
    diceType: 'd6',
    modifier: 0,
    damageType: 'piercing',
    tags: ['weapon', 'finesse', 'light']
  },
  {
    id: 'longsword',
    name: 'Longsword (One-handed)',
    description: 'Longsword wielded in one hand',
    diceCount: 1,
    diceType: 'd8',
    modifier: 0,
    damageType: 'slashing',
    tags: ['weapon', 'versatile']
  },
  {
    id: 'longsword-two-handed',
    name: 'Longsword (Two-handed)',
    description: 'Longsword wielded in two hands',
    diceCount: 1,
    diceType: 'd10',
    modifier: 0,
    damageType: 'slashing',
    tags: ['weapon', 'versatile', 'two-handed']
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: '3rd level fireball spell',
    diceCount: 8,
    diceType: 'd6',
    modifier: 0,
    damageType: 'fire',
    tags: ['spell', 'evocation', 'area']
  },
  {
    id: 'burning-hands',
    name: 'Burning Hands',
    description: '1st level burning hands spell',
    diceCount: 3,
    diceType: 'd6',
    modifier: 0,
    damageType: 'fire',
    tags: ['spell', 'evocation', 'area']
  },
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    description: 'Single magic missile dart',
    diceCount: 1,
    diceType: 'd4',
    modifier: 1,
    damageType: 'force',
    tags: ['spell', 'evocation', 'automatic']
  }
];

/**
 * Dice value mappings for calculations
 */
export const DICE_VALUES: Record<DiceType, number> = {
  'd4': 4,
  'd6': 6,
  'd8': 8,
  'd10': 10,
  'd12': 12,
  'd20': 20
};

/**
 * Resistance multipliers for damage calculation
 */
export const RESISTANCE_MULTIPLIERS: Record<ResistanceType, number> = {
  normal: 1,
  resistant: 0.5,
  vulnerable: 2,
  immune: 0
};