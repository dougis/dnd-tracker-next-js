import { SUBSCRIPTION_LIMITS } from '../User';

describe('User Model Constants', () => {
  describe('SUBSCRIPTION_LIMITS', () => {
    it('should have correct limits for free tier', () => {
      expect(SUBSCRIPTION_LIMITS.free).toEqual({
        parties: 1,
        encounters: 3,
        characters: 10,
      });
    });

    it('should have correct limits for seasoned tier', () => {
      expect(SUBSCRIPTION_LIMITS.seasoned).toEqual({
        parties: 3,
        encounters: 15,
        characters: 50,
      });
    });

    it('should have correct limits for expert tier', () => {
      expect(SUBSCRIPTION_LIMITS.expert).toEqual({
        parties: 10,
        encounters: 50,
        characters: 200,
      });
    });

    it('should have correct limits for master tier', () => {
      expect(SUBSCRIPTION_LIMITS.master).toEqual({
        parties: 25,
        encounters: 100,
        characters: 500,
      });
    });

    it('should have correct limits for guild tier', () => {
      expect(SUBSCRIPTION_LIMITS.guild).toEqual({
        parties: Infinity,
        encounters: Infinity,
        characters: Infinity,
      });
    });

    it('should have all required subscription tiers', () => {
      const tiers = Object.keys(SUBSCRIPTION_LIMITS);
      expect(tiers).toEqual(['free', 'seasoned', 'expert', 'master', 'guild']);
    });

    it('should have all required features for each tier', () => {
      const requiredFeatures = ['parties', 'encounters', 'characters'];
      
      Object.values(SUBSCRIPTION_LIMITS).forEach(tierLimits => {
        const features = Object.keys(tierLimits);
        expect(features.sort()).toEqual(requiredFeatures.sort());
      });
    });

    it('should have increasing limits across tiers (except guild)', () => {
      const tiers = ['free', 'seasoned', 'expert', 'master'];
      const features = ['parties', 'encounters', 'characters'];

      features.forEach(feature => {
        for (let i = 1; i < tiers.length; i++) {
          const prevTier = tiers[i - 1] as keyof typeof SUBSCRIPTION_LIMITS;
          const currentTier = tiers[i] as keyof typeof SUBSCRIPTION_LIMITS;
          
          expect(SUBSCRIPTION_LIMITS[currentTier][feature as keyof typeof SUBSCRIPTION_LIMITS.free])
            .toBeGreaterThan(SUBSCRIPTION_LIMITS[prevTier][feature as keyof typeof SUBSCRIPTION_LIMITS.free]);
        }
      });
    });
  });
});