// Utility functions for combat stats calculations and helpers

export type CharacterClass = 'barbarian' | 'fighter' | 'paladin' | 'ranger' |
  'bard' | 'cleric' | 'druid' | 'monk' | 'rogue' | 'warlock' | 'wizard' | 'sorcerer';

interface ClassData {
  className: string;
  level: number;
}

/**
 * Calculate ability score modifier
 */
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Calculate proficiency bonus based on total character level
 */
export const calculateProficiencyBonus = (classes: ClassData[]): number => {
  const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
  return Math.ceil(totalLevel / 4) + 1;
};

/**
 * Get hit die size for a character class
 */
export const getHitDieSize = (className: string): number => {
  const hitDieMap: Record<string, number> = {
    'barbarian': 12,
    'fighter': 10,
    'paladin': 10,
    'ranger': 10,
    'bard': 8,
    'cleric': 8,
    'druid': 8,
    'monk': 8,
    'rogue': 8,
    'warlock': 8,
    'wizard': 6,
    'sorcerer': 6,
  };

  return hitDieMap[className] || 8; // Default to d8
};

/**
 * Get primary hit die for character (uses first class)
 */
export const getPrimaryHitDie = (classes: ClassData[]): string => {
  if (classes.length === 0) return 'd8';

  const hitDieSize = getHitDieSize(classes[0].className);
  return `d${hitDieSize}`;
};

/**
 * Calculate total character level
 */
export const getTotalLevel = (classes: ClassData[]): number => {
  return classes.reduce((sum, cls) => sum + cls.level, 0);
};

/**
 * Format modifier with sign
 */
export const formatModifier = (modifier: number): string => {
  return `${modifier >= 0 ? '+' : ''}${modifier}`;
};

/**
 * Parse number input safely
 */
export const parseNumberInput = (value: string): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
};