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
 * Validation helper functions
 */
export const validationHelpers = {

  /**
   * Validates that all tiers have required structure
   */
  validateTierStructure: (limits: SubscriptionLimits) => {
    TIER_NAMES.forEach(tier => {
      expect(limits).toHaveProperty(tier);
      expect(limits[tier]).toEqual(
        expect.objectContaining({
          parties: expect.any(Number),
          encounters: expect.any(Number),
          characters: expect.any(Number),
        })
      );
    });
  },

  /**
   * Validates that all features exist for all tiers
   */
  validateFeatureStructure: (limits: SubscriptionLimits) => {
    FEATURE_NAMES.forEach(feature => {
      TIER_NAMES.forEach(tier => {
        expect(limits[tier]).toHaveProperty(feature);
        expect(typeof limits[tier][feature]).toBe('number');
      });
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
    TIER_NAMES.forEach(tier => {
      const tierLimits = limits[tier];

      expect(tierLimits).toEqual(
        expect.objectContaining({
          parties: expect.any(Number),
          encounters: expect.any(Number),
          characters: expect.any(Number),
        })
      );

      // Should have exactly these three properties
      expect(Object.keys(tierLimits)).toHaveLength(3);
    });
  },

  /**
   * Validates data types are consistent
   */
  validateDataTypes: (limits: SubscriptionLimits) => {
    TIER_NAMES.forEach(tier => {
      FEATURE_NAMES.forEach(feature => {
        const limit = limits[tier][feature];
        expect(typeof limit).toBe('number');
        expect(Number.isInteger(limit)).toBe(true);
      });
    });
  },

  /**
   * Validates no negative limits except unlimited (-1)
   */
  validatePositiveLimits: (limits: SubscriptionLimits) => {
    TIER_NAMES.forEach(tier => {
      FEATURE_NAMES.forEach(feature => {
        const limit = limits[tier][feature];
        expect(limit === -1 || limit > 0).toBe(true);
      });
    });
  },
};