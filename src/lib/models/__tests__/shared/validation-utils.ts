/**
 * Shared validation utilities for model tests
 * Eliminates duplication across test files
 */

export const TIER_NAMES = ['free', 'seasoned', 'expert', 'master', 'guild'] as const;
export const FEATURE_NAMES = ['parties', 'encounters', 'characters'] as const;

export type SubscriptionTier = typeof TIER_NAMES[number];
export type FeatureName = typeof FEATURE_NAMES[number];

export type SubscriptionLimits = {
  [_ in SubscriptionTier]: {
    [__ in FeatureName]: number;
  };
};

/**
 * Mock subscription limits for testing
 */
export const MOCK_SUBSCRIPTION_LIMITS: SubscriptionLimits = {
  free: { parties: 1, encounters: 3, characters: 10 },
  seasoned: { parties: 3, encounters: 15, characters: 50 },
  expert: { parties: 10, encounters: 50, characters: 200 },
  master: { parties: 25, encounters: 100, characters: 500 },
  guild: { parties: -1, encounters: -1, characters: -1 }, // -1 = unlimited
};

/**
 * Check if current count is within tier limit
 */
export const checkLimit = (
  tier: SubscriptionTier,
  feature: FeatureName,
  currentCount: number
): boolean => {
  const limit = MOCK_SUBSCRIPTION_LIMITS[tier][feature];
  return limit === -1 || currentCount < limit;
};

/**
 * Calculate upgrade benefit between tiers
 */
export const calculateUpgradeBenefit = (
  fromTier: SubscriptionTier,
  toTier: SubscriptionTier,
  feature: FeatureName
): number | 'unlimited' => {
  const fromLimit = MOCK_SUBSCRIPTION_LIMITS[fromTier][feature];
  const toLimit = MOCK_SUBSCRIPTION_LIMITS[toTier][feature];

  if (toLimit === -1) return 'unlimited';
  if (fromLimit === -1) return 0;
  return toLimit - fromLimit;
};

/**
 * Common validation patterns
 */
const expectFeatureStructure = {
  parties: expect.any(Number),
  encounters: expect.any(Number),
  characters: expect.any(Number),
};

/**
 * Generic validation functions
 */
const validateForEachTier = (limits: SubscriptionLimits, validator: (_tier: SubscriptionTier, _tierLimits: any) => void) => {
  TIER_NAMES.forEach(tier => validator(tier, limits[tier]));
};

const validateForEachFeature = (limits: SubscriptionLimits, validator: (_feature: FeatureName, _tier: SubscriptionTier, _limit: number) => void) => {
  FEATURE_NAMES.forEach(feature => {
    TIER_NAMES.forEach(tier => validator(feature, tier, limits[tier][feature]));
  });
};

/**
 * Validation helper functions
 */
export const validationHelpers = {

  /**
   * Validates that all tiers have required structure
   */
  validateTierStructure: (limits: SubscriptionLimits) => {
    validateForEachTier(limits, (tier) => {
      expect(limits).toHaveProperty(tier);
      expect(limits[tier]).toEqual(expect.objectContaining(expectFeatureStructure));
    });
  },

  /**
   * Validates that all features exist for all tiers
   */
  validateFeatureStructure: (limits: SubscriptionLimits) => {
    validateForEachFeature(limits, (feature, tier) => {
      expect(limits[tier]).toHaveProperty(feature);
      expect(typeof limits[tier][feature]).toBe('number');
    });
  },

  /**
   * Validates progressive limits (free < seasoned < expert < master)
   */
  validateProgressiveLimits: (limits: SubscriptionLimits) => {
    const progressiveTiers = ['free', 'seasoned', 'expert', 'master'] as const;

    FEATURE_NAMES.forEach(feature => {
      for (let i = 0; i < progressiveTiers.length - 1; i++) {
        const currentTier = progressiveTiers[i];
        const nextTier = progressiveTiers[i + 1];

        expect(limits[currentTier][feature]).toBeLessThan(
          limits[nextTier][feature]
        );
      }
    });
  },

  /**
   * Validates guild tier has unlimited access
   */
  validateUnlimitedGuild: (limits: SubscriptionLimits) => {
    FEATURE_NAMES.forEach(feature => {
      expect(limits.guild[feature]).toBe(-1);
    });
  },

  /**
   * Validates consistent object structure
   */
  validateConsistentStructure: (limits: SubscriptionLimits) => {
    validateForEachTier(limits, (tier, tierLimits) => {
      expect(tierLimits).toEqual(expect.objectContaining(expectFeatureStructure));
      expect(Object.keys(tierLimits)).toHaveLength(3);
    });
  },

  /**
   * Validates data types are consistent
   */
  validateDataTypes: (limits: SubscriptionLimits) => {
    validateForEachFeature(limits, (feature, tier, limit) => {
      expect(typeof limit).toBe('number');
      expect(Number.isInteger(limit)).toBe(true);
    });
  },

  /**
   * Validates no negative limits except unlimited (-1)
   */
  validatePositiveLimits: (limits: SubscriptionLimits) => {
    validateForEachFeature(limits, (feature, tier, limit) => {
      expect(limit === -1 || limit > 0).toBe(true);
    });
  },
};