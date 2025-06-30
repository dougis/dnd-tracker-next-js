import { SUBSCRIPTION_LIMITS } from '../User';

describe('User Model Constants', () => {
  // Constants to avoid duplication
  const TIER_NAMES = ['free', 'seasoned', 'expert', 'master', 'guild'] as const;
  const FEATURE_NAMES = ['parties', 'encounters', 'characters'] as const;

  const EXPECTED_LIMITS = {
    free: { parties: 1, encounters: 3, characters: 10 },
    seasoned: { parties: 3, encounters: 15, characters: 50 },
    expert: { parties: 10, encounters: 50, characters: 200 },
    master: { parties: 25, encounters: 100, characters: 500 },
    guild: { parties: Infinity, encounters: Infinity, characters: Infinity },
  } as const;

  describe('SUBSCRIPTION_LIMITS', () => {
    it('should have correct limits for all tiers', () => {
      TIER_NAMES.forEach(tier => {
        expect(SUBSCRIPTION_LIMITS[tier]).toEqual(EXPECTED_LIMITS[tier]);
      });
    });

    it('should have all required subscription tiers', () => {
      const actualTiers = Object.keys(SUBSCRIPTION_LIMITS);
      expect(actualTiers.sort()).toEqual([...TIER_NAMES].sort());
    });

    it('should have all required features for each tier', () => {
      Object.values(SUBSCRIPTION_LIMITS).forEach(tierLimits => {
        const features = Object.keys(tierLimits);
        expect(features.sort()).toEqual([...FEATURE_NAMES].sort());
      });
    });

    it('should have increasing limits across tiers (except guild)', () => {
      const nonGuildTiers = TIER_NAMES.slice(0, -1); // All except 'guild'

      FEATURE_NAMES.forEach(feature => {
        for (let i = 1; i < nonGuildTiers.length; i++) {
          const prevTier = nonGuildTiers[i - 1];
          const currentTier = nonGuildTiers[i];

          expect(SUBSCRIPTION_LIMITS[currentTier][feature])
            .toBeGreaterThan(SUBSCRIPTION_LIMITS[prevTier][feature]);
        }
      });
    });
  });
});
