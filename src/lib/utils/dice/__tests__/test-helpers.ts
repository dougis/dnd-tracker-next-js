import { DamageCalculationInput, DamageCalculationResult, DamageType, ResistanceType } from '../damage-calculation';

/**
 * Test data for damage calculation scenarios
 */
export const DAMAGE_TEST_SCENARIOS = {
  // Basic damage scenarios
  lightDamage: {
    diceCount: 1,
    diceType: 'd4' as const,
    modifier: 1,
    damageType: 'piercing' as DamageType
  },
  moderateDamage: {
    diceCount: 2,
    diceType: 'd6' as const,
    modifier: 3,
    damageType: 'slashing' as DamageType
  },
  heavyDamage: {
    diceCount: 3,
    diceType: 'd8' as const,
    modifier: 5,
    damageType: 'fire' as DamageType
  },
  // Edge cases
  noDamage: {
    diceCount: 0,
    diceType: 'd4' as const,
    modifier: 0,
    damageType: 'bludgeoning' as DamageType
  },
  negativeModifier: {
    diceCount: 1,
    diceType: 'd6' as const,
    modifier: -3,
    damageType: 'cold' as DamageType
  },
  // Critical scenarios
  criticalHit: {
    diceCount: 2,
    diceType: 'd6' as const,
    modifier: 4,
    damageType: 'slashing' as DamageType
  }
};

/**
 * Expected damage results for specific dice rolls
 */
export const EXPECTED_DAMAGE_RESULTS = {
  // For mocked dice rolls [4, 5] with modifier 3
  twoD6Plus3: {
    totalDamage: 12,
    diceRolls: [4, 5],
    modifier: 3,
    damageType: 'slashing' as DamageType
  },
  // For mocked dice roll [8] with modifier 0
  oneD8: {
    totalDamage: 8,
    diceRolls: [8],
    modifier: 0,
    damageType: 'fire' as DamageType
  }
};

/**
 * Resistance test scenarios
 */
export const RESISTANCE_SCENARIOS = [
  {
    type: 'normal' as ResistanceType,
    multiplier: 1,
    description: 'Normal damage (no resistance)'
  },
  {
    type: 'resistant' as ResistanceType,
    multiplier: 0.5,
    description: 'Resistant (half damage)'
  },
  {
    type: 'vulnerable' as ResistanceType,
    multiplier: 2,
    description: 'Vulnerable (double damage)'
  },
  {
    type: 'immune' as ResistanceType,
    multiplier: 0,
    description: 'Immune (no damage)'
  }
];

/**
 * Mock random values for predictable dice rolls
 */
export const MOCK_DICE_ROLLS = {
  d4: {
    min: 0,      // rolls 1
    mid: 0.5,    // rolls 3
    max: 0.99    // rolls 4
  },
  d6: {
    min: 0,      // rolls 1
    mid: 0.5,    // rolls 4
    max: 0.99    // rolls 6
  },
  d8: {
    min: 0,      // rolls 1
    mid: 0.5,    // rolls 5
    max: 0.99    // rolls 8
  },
  d10: {
    min: 0,      // rolls 1
    mid: 0.5,    // rolls 6
    max: 0.99    // rolls 10
  },
  d12: {
    min: 0,      // rolls 1
    mid: 0.5,    // rolls 7
    max: 0.99    // rolls 12
  },
  d20: {
    min: 0,      // rolls 1
    mid: 0.5,    // rolls 11
    max: 0.99    // rolls 20
  }
};

/**
 * Helper function to mock Math.random for predictable dice rolls
 */
export function mockDiceRolls(rollValues: number[]): jest.SpyInstance {
  const mockRandom = jest.spyOn(Math, 'random');
  rollValues.forEach((value, index) => {
    mockRandom.mockReturnValueOnce(value);
  });
  return mockRandom;
}

/**
 * Helper function to restore Math.random after mocking
 */
export function restoreMathRandom(mockRandom: jest.SpyInstance): void {
  mockRandom.mockRestore();
}

/**
 * Creates a basic damage calculation result for testing
 */
export function createBasicDamageResult(overrides: Partial<DamageCalculationResult> = {}): DamageCalculationResult {
  return {
    totalDamage: 10,
    diceRolls: [6, 4],
    modifier: 0,
    damageType: 'slashing',
    isCritical: false,
    ...overrides
  };
}

/**
 * All D&D 5e damage types for comprehensive testing
 */
export const ALL_DAMAGE_TYPES: DamageType[] = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder'
];

/**
 * All resistance types for comprehensive testing
 */
export const ALL_RESISTANCE_TYPES: ResistanceType[] = [
  'normal',
  'resistant',
  'vulnerable',
  'immune'
];

/**
 * Common dice types used in D&D
 */
export const COMMON_DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const;