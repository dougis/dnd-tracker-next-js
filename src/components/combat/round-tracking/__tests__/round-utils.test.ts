import {
  formatDuration,
  calculateRemainingDuration,
  isEffectExpiring,
  calculateAverageRoundDuration,
  validateRoundNumber,
  calculateEffectRemainingDuration,
  sortTriggersByRound,
  filterActiveTriggers,
  formatRoundSummary,
} from '../round-utils';
import { TEST_EFFECTS, TEST_TRIGGERS, createMockEffect, createMockTrigger } from './round-tracking-test-helpers';

describe('round-utils', () => {
  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(0)).toBe('0s');
    });

    it('formats minutes correctly', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(120)).toBe('2m');
    });

    it('formats hours correctly', () => {
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(3665)).toBe('1h 1m 5s');
      expect(formatDuration(7200)).toBe('2h');
    });

    it('handles edge cases', () => {
      expect(formatDuration(-1)).toBe('0s');
      expect(formatDuration(0.5)).toBe('1s'); // Rounds up
    });
  });

  describe('calculateRemainingDuration', () => {
    it('calculates remaining time with max rounds', () => {
      const result = calculateRemainingDuration(2, 5, 150); // Round 2 of 5, 150s average
      expect(result).toBe(450); // 3 rounds * 150s
    });

    it('returns null when no max rounds', () => {
      const result = calculateRemainingDuration(2, undefined, 150);
      expect(result).toBeNull();
    });

    it('returns 0 when past max rounds', () => {
      const result = calculateRemainingDuration(6, 5, 150);
      expect(result).toBe(0);
    });

    it('handles zero average duration', () => {
      const result = calculateRemainingDuration(2, 5, 0);
      expect(result).toBe(0);
    });
  });

  describe('isEffectExpiring', () => {
    it('identifies expiring effects (1 round remaining)', () => {
      const effect = createMockEffect({ duration: 2, startRound: 1 });
      expect(isEffectExpiring(effect, 2)).toBe(true);
    });

    it('does not flag non-expiring effects', () => {
      const effect = createMockEffect({ duration: 5, startRound: 1 });
      expect(isEffectExpiring(effect, 2)).toBe(false);
    });

    it('handles effects that have already expired', () => {
      const effect = createMockEffect({ duration: 1, startRound: 1 });
      expect(isEffectExpiring(effect, 3)).toBe(false); // Already expired
    });

    it('handles effects starting in current round', () => {
      const effect = createMockEffect({ duration: 1, startRound: 2 });
      expect(isEffectExpiring(effect, 2)).toBe(true);
    });
  });

  describe('calculateAverageRoundDuration', () => {
    it('calculates average correctly', () => {
      const startTime = new Date(Date.now() - 300000); // 5 minutes ago
      const result = calculateAverageRoundDuration(startTime, 5);
      expect(result).toBe(60); // 300s / 5 rounds = 60s per round
    });

    it('handles single round', () => {
      const startTime = new Date(Date.now() - 120000); // 2 minutes ago
      const result = calculateAverageRoundDuration(startTime, 1);
      expect(result).toBe(120);
    });

    it('handles zero rounds', () => {
      const startTime = new Date();
      const result = calculateAverageRoundDuration(startTime, 0);
      expect(result).toBe(0);
    });

    it('handles undefined start time', () => {
      const result = calculateAverageRoundDuration(undefined, 5);
      expect(result).toBe(0);
    });
  });

  describe('validateRoundNumber', () => {
    it('validates positive integers', () => {
      expect(validateRoundNumber(1)).toBe(true);
      expect(validateRoundNumber(10)).toBe(true);
      expect(validateRoundNumber(100)).toBe(true);
    });

    it('rejects invalid numbers', () => {
      expect(validateRoundNumber(0)).toBe(false);
      expect(validateRoundNumber(-1)).toBe(false);
      expect(validateRoundNumber(1.5)).toBe(false);
      expect(validateRoundNumber(NaN)).toBe(false);
      expect(validateRoundNumber(Infinity)).toBe(false);
    });

    it('handles string inputs', () => {
      expect(validateRoundNumber('1' as any)).toBe(false);
      expect(validateRoundNumber(undefined as any)).toBe(false);
      expect(validateRoundNumber(null as any)).toBe(false);
    });
  });

  describe('calculateEffectRemainingDuration', () => {
    it('calculates remaining duration correctly', () => {
      const effect = createMockEffect({ duration: 5, startRound: 2 });
      expect(calculateEffectRemainingDuration(effect, 3)).toBe(4); // 5 - (3-2)
      expect(calculateEffectRemainingDuration(effect, 2)).toBe(5); // 5 - (2-2)
      expect(calculateEffectRemainingDuration(effect, 7)).toBe(0); // Already expired
    });

    it('handles effects starting before current round', () => {
      const effect = createMockEffect({ duration: 3, startRound: 1 });
      expect(calculateEffectRemainingDuration(effect, 3)).toBe(1); // 3 - (3-1)
      expect(calculateEffectRemainingDuration(effect, 4)).toBe(0); // Expired
    });

    it('handles effects starting in future rounds', () => {
      const effect = createMockEffect({ duration: 3, startRound: 5 });
      expect(calculateEffectRemainingDuration(effect, 3)).toBe(3); // Not started yet
    });
  });

  describe('sortTriggersByRound', () => {
    it('sorts triggers by trigger round ascending', () => {
      const triggers = [
        createMockTrigger({ triggerRound: 5 }),
        createMockTrigger({ triggerRound: 2 }),
        createMockTrigger({ triggerRound: 8 }),
      ];

      const sorted = sortTriggersByRound(triggers);
      expect(sorted[0].triggerRound).toBe(2);
      expect(sorted[1].triggerRound).toBe(5);
      expect(sorted[2].triggerRound).toBe(8);
    });

    it('maintains order for same trigger round', () => {
      const triggers = [
        createMockTrigger({ triggerRound: 3, name: 'First' }),
        createMockTrigger({ triggerRound: 3, name: 'Second' }),
        createMockTrigger({ triggerRound: 3, name: 'Third' }),
      ];

      const sorted = sortTriggersByRound(triggers);
      expect(sorted[0].name).toBe('First');
      expect(sorted[1].name).toBe('Second');
      expect(sorted[2].name).toBe('Third');
    });

    it('handles empty array', () => {
      expect(sortTriggersByRound([])).toEqual([]);
    });
  });

  describe('filterActiveTriggers', () => {
    it('filters only active triggers', () => {
      const triggers = [
        createMockTrigger({ isActive: true }),
        createMockTrigger({ isActive: false }),
        createMockTrigger({ isActive: true }),
      ];

      const active = filterActiveTriggers(triggers);
      expect(active).toHaveLength(2);
      expect(active.every(t => t.isActive)).toBe(true);
    });

    it('returns empty array when no active triggers', () => {
      const triggers = [
        createMockTrigger({ isActive: false }),
        createMockTrigger({ isActive: false }),
      ];

      const active = filterActiveTriggers(triggers);
      expect(active).toHaveLength(0);
    });

    it('handles empty array', () => {
      expect(filterActiveTriggers([])).toEqual([]);
    });
  });

  describe('formatRoundSummary', () => {
    it('formats basic summary', () => {
      const summary = {
        totalRounds: 5,
        totalDuration: 300,
        totalActions: 12,
      };

      const formatted = formatRoundSummary(summary);
      expect(formatted).toContain('5 rounds');
      expect(formatted).toContain('5m total');
      expect(formatted).toContain('12 actions');
      expect(formatted).toContain('1m/round avg');
    });

    it('handles zero values', () => {
      const summary = {
        totalRounds: 0,
        totalDuration: 0,
        totalActions: 0,
      };

      const formatted = formatRoundSummary(summary);
      expect(formatted).toContain('0 rounds');
      expect(formatted).toContain('0s total');
      expect(formatted).toContain('0 actions');
    });

    it('handles missing optional fields', () => {
      const summary = {
        totalRounds: 3,
        totalDuration: 180,
      };

      const formatted = formatRoundSummary(summary);
      expect(formatted).toContain('3 rounds');
      expect(formatted).toContain('3m total');
      expect(formatted).toContain('1m/round avg');
      expect(formatted).not.toContain('actions');
    });

    it('includes damage and healing when provided', () => {
      const summary = {
        totalRounds: 5,
        totalDuration: 300,
        totalActions: 12,
        damageDealt: 150,
        healingApplied: 45,
      };

      const formatted = formatRoundSummary(summary);
      expect(formatted).toContain('150 damage');
      expect(formatted).toContain('45 healing');
    });

    it('handles long durations correctly', () => {
      const summary = {
        totalRounds: 20,
        totalDuration: 3900, // 65 minutes
        totalActions: 50,
      };

      const formatted = formatRoundSummary(summary);
      expect(formatted).toContain('20 rounds');
      expect(formatted).toContain('1h 5m total');
      expect(formatted).toContain('3m 15s/round avg');
    });
  });

  describe('Integration Tests', () => {
    it('works with real test data', () => {
      const effect = TEST_EFFECTS[0]; // Poison effect (duration 3, startRound 1)
      const currentRound = 2;

      expect(calculateEffectRemainingDuration(effect, currentRound)).toBe(2);
      expect(isEffectExpiring(effect, currentRound)).toBe(false); // Should be false, 2 rounds remaining
      
      // Test with the Haste effect which should be expiring
      const hasteEffect = TEST_EFFECTS[2]; // Haste effect (duration 1, startRound 2)
      expect(calculateEffectRemainingDuration(hasteEffect, currentRound)).toBe(1);
      expect(isEffectExpiring(hasteEffect, currentRound)).toBe(true); // Should be true, 1 round remaining
    });

    it('handles complete round tracking scenario', () => {
      const currentRound = 3;
      const maxRounds = 10;
      const startTime = new Date(Date.now() - 360000); // 6 minutes ago
      
      const avgDuration = calculateAverageRoundDuration(startTime, currentRound);
      expect(avgDuration).toBe(120); // 6 minutes / 3 rounds = 2 minutes per round
      
      const remaining = calculateRemainingDuration(currentRound, maxRounds, avgDuration);
      expect(remaining).toBe(840); // 7 rounds * 120s = 840s
      
      const formattedRemaining = formatDuration(remaining);
      expect(formattedRemaining).toBe('14m');
    });

    it('processes multiple effects and triggers', () => {
      const currentRound = 2;
      
      // Test effect processing
      const expiringEffects = TEST_EFFECTS.filter(effect => 
        isEffectExpiring(effect, currentRound)
      );
      expect(expiringEffects).toHaveLength(1); // Only the haste effect
      
      // Test trigger processing
      const activeTriggers = filterActiveTriggers(TEST_TRIGGERS);
      const sortedTriggers = sortTriggersByRound(activeTriggers);
      expect(sortedTriggers[0].triggerRound).toBeLessThanOrEqual(sortedTriggers[1].triggerRound);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid effect data gracefully', () => {
      const invalidEffect = { ...createMockEffect(), duration: -1 };
      expect(calculateEffectRemainingDuration(invalidEffect, 2)).toBe(0);
    });

    it('handles invalid round numbers gracefully', () => {
      const effect = createMockEffect();
      expect(calculateEffectRemainingDuration(effect, -1)).toBe(effect.duration);
      expect(calculateEffectRemainingDuration(effect, 0)).toBe(effect.duration);
    });

    it('handles malformed duration data', () => {
      expect(formatDuration(NaN)).toBe('0s');
      expect(formatDuration(Infinity)).toBe('0s');
      expect(formatDuration(-Infinity)).toBe('0s');
    });

    it('handles empty or undefined arrays', () => {
      expect(sortTriggersByRound(undefined as any)).toEqual([]);
      expect(filterActiveTriggers(undefined as any)).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('handles large numbers of effects efficiently', () => {
      const manyEffects = Array.from({ length: 1000 }, (_, i) => 
        createMockEffect({ id: `effect-${i}`, startRound: i % 10 + 1 })
      );

      const start = performance.now();
      const expiring = manyEffects.filter(effect => isEffectExpiring(effect, 5));
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // Should be very fast
      expect(expiring.length).toBeGreaterThan(0);
    });

    it('handles large numbers of triggers efficiently', () => {
      const manyTriggers = Array.from({ length: 1000 }, (_, i) => 
        createMockTrigger({ id: `trigger-${i}`, triggerRound: i % 20 + 1 })
      );

      const start = performance.now();
      const sorted = sortTriggersByRound(manyTriggers);
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should be reasonably fast
      expect(sorted).toHaveLength(1000);
      
      // Verify sorting is correct
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].triggerRound).toBeGreaterThanOrEqual(sorted[i - 1].triggerRound);
      }
    });
  });
});