import {
  rollDice,
  rollMultipleDice,
  rollDamage,
  rollCriticalDamage,
  DiceType,
  DiceRollResult
} from '../dice-rolling';
import { mockDiceRolls, restoreMathRandom, MOCK_DICE_ROLLS } from './test-helpers';

describe('dice-rolling', () => {
  describe('rollDice', () => {
    it('should roll d4 correctly', () => {
      const mockRandom = mockDiceRolls([MOCK_DICE_ROLLS.d4.min, MOCK_DICE_ROLLS.d4.mid, MOCK_DICE_ROLLS.d4.max]);

      expect(rollDice('d4')).toBe(1);
      expect(rollDice('d4')).toBe(3);
      expect(rollDice('d4')).toBe(4);

      restoreMathRandom(mockRandom);
    });

    it('should roll d6 correctly', () => {
      const mockRandom = mockDiceRolls([MOCK_DICE_ROLLS.d6.min, MOCK_DICE_ROLLS.d6.mid, MOCK_DICE_ROLLS.d6.max]);

      expect(rollDice('d6')).toBe(1);
      expect(rollDice('d6')).toBe(4);
      expect(rollDice('d6')).toBe(6);

      restoreMathRandom(mockRandom);
    });

    it('should roll d8 correctly', () => {
      const mockRandom = mockDiceRolls([MOCK_DICE_ROLLS.d8.min, MOCK_DICE_ROLLS.d8.mid, MOCK_DICE_ROLLS.d8.max]);

      expect(rollDice('d8')).toBe(1);
      expect(rollDice('d8')).toBe(5);
      expect(rollDice('d8')).toBe(8);

      restoreMathRandom(mockRandom);
    });

    it('should roll d10 correctly', () => {
      const mockRandom = mockDiceRolls([MOCK_DICE_ROLLS.d10.min, MOCK_DICE_ROLLS.d10.mid, MOCK_DICE_ROLLS.d10.max]);

      expect(rollDice('d10')).toBe(1);
      expect(rollDice('d10')).toBe(6);
      expect(rollDice('d10')).toBe(10);

      restoreMathRandom(mockRandom);
    });

    it('should roll d12 correctly', () => {
      const mockRandom = mockDiceRolls([MOCK_DICE_ROLLS.d12.min, MOCK_DICE_ROLLS.d12.mid, MOCK_DICE_ROLLS.d12.max]);

      expect(rollDice('d12')).toBe(1);
      expect(rollDice('d12')).toBe(7);
      expect(rollDice('d12')).toBe(12);

      restoreMathRandom(mockRandom);
    });

    it('should roll d20 correctly', () => {
      const mockRandom = mockDiceRolls([MOCK_DICE_ROLLS.d20.min, MOCK_DICE_ROLLS.d20.mid, MOCK_DICE_ROLLS.d20.max]);

      expect(rollDice('d20')).toBe(1);
      expect(rollDice('d20')).toBe(11);
      expect(rollDice('d20')).toBe(20);

      restoreMathRandom(mockRandom);
    });

    it('should always return values within valid range', () => {
      // Run multiple random rolls to ensure they're always in range
      for (let i = 0; i < 100; i++) {
        expect(rollDice('d4')).toBeGreaterThanOrEqual(1);
        expect(rollDice('d4')).toBeLessThanOrEqual(4);
        
        expect(rollDice('d6')).toBeGreaterThanOrEqual(1);
        expect(rollDice('d6')).toBeLessThanOrEqual(6);
        
        expect(rollDice('d8')).toBeGreaterThanOrEqual(1);
        expect(rollDice('d8')).toBeLessThanOrEqual(8);
        
        expect(rollDice('d10')).toBeGreaterThanOrEqual(1);
        expect(rollDice('d10')).toBeLessThanOrEqual(10);
        
        expect(rollDice('d12')).toBeGreaterThanOrEqual(1);
        expect(rollDice('d12')).toBeLessThanOrEqual(12);
        
        expect(rollDice('d20')).toBeGreaterThanOrEqual(1);
        expect(rollDice('d20')).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('rollMultipleDice', () => {
    it('should roll multiple dice correctly', () => {
      const mockRandom = mockDiceRolls([0.5, 0.7, 0.3]); // d6: 4, 5, 2

      const result = rollMultipleDice(3, 'd6');
      expect(result).toEqual([4, 5, 2]);

      restoreMathRandom(mockRandom);
    });

    it('should handle single die', () => {
      const mockRandom = mockDiceRolls([0.9]); // d8: 8

      const result = rollMultipleDice(1, 'd8');
      expect(result).toEqual([8]);

      restoreMathRandom(mockRandom);
    });

    it('should handle zero dice', () => {
      const result = rollMultipleDice(0, 'd6');
      expect(result).toEqual([]);
    });

    it('should return correct number of dice', () => {
      const result = rollMultipleDice(5, 'd6');
      expect(result).toHaveLength(5);
      
      result.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('rollDamage', () => {
    it('should calculate damage with dice and modifier', () => {
      const mockRandom = mockDiceRolls([0.5, 0.8]); // d6: 4, 5

      const result = rollDamage(2, 'd6', 3);
      expect(result.rolls).toEqual([4, 5]);
      expect(result.total).toBe(12); // 4 + 5 + 3
      expect(result.modifier).toBe(3);

      restoreMathRandom(mockRandom);
    });

    it('should handle no modifier', () => {
      const mockRandom = mockDiceRolls([0.9]); // d8: 8

      const result = rollDamage(1, 'd8');
      expect(result.rolls).toEqual([8]);
      expect(result.total).toBe(8);
      expect(result.modifier).toBe(0);

      restoreMathRandom(mockRandom);
    });

    it('should handle negative modifier', () => {
      const mockRandom = mockDiceRolls([0.9]); // d4: 4

      const result = rollDamage(1, 'd4', -2);
      expect(result.rolls).toEqual([4]);
      expect(result.total).toBe(2); // 4 - 2
      expect(result.modifier).toBe(-2);

      restoreMathRandom(mockRandom);
    });

    it('should enforce minimum damage of 0', () => {
      const mockRandom = mockDiceRolls([0]); // d4: 1

      const result = rollDamage(1, 'd4', -5);
      expect(result.rolls).toEqual([1]);
      expect(result.total).toBe(0); // Math.max(0, 1 - 5)
      expect(result.modifier).toBe(-5);

      restoreMathRandom(mockRandom);
    });
  });

  describe('rollCriticalDamage', () => {
    it('should double dice count for critical hits', () => {
      const mockRandom = mockDiceRolls([0.5, 0.7, 0.3, 0.9]); // d6: 4, 5, 2, 6

      const result = rollCriticalDamage(2, 'd6', 3);
      expect(result.rolls).toEqual([4, 5, 2, 6]);
      expect(result.total).toBe(20); // 4 + 5 + 2 + 6 + 3
      expect(result.modifier).toBe(3);
      expect(result.isCritical).toBe(true);

      restoreMathRandom(mockRandom);
    });

    it('should handle single die critical', () => {
      const mockRandom = mockDiceRolls([0.9, 0.1]); // d8: 8, 1

      const result = rollCriticalDamage(1, 'd8', 2);
      expect(result.rolls).toEqual([8, 1]);
      expect(result.total).toBe(11); // 8 + 1 + 2
      expect(result.modifier).toBe(2);
      expect(result.isCritical).toBe(true);

      restoreMathRandom(mockRandom);
    });

    it('should not double the modifier', () => {
      const mockRandom = mockDiceRolls([0.5, 0.5]); // d6: 4, 4

      const result = rollCriticalDamage(1, 'd6', 10);
      expect(result.rolls).toEqual([4, 4]);
      expect(result.total).toBe(18); // 4 + 4 + 10 (not 20)
      expect(result.modifier).toBe(10);

      restoreMathRandom(mockRandom);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle very large dice counts', () => {
      const result = rollMultipleDice(10, 'd6');
      expect(result).toHaveLength(10);
      
      result.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });

    it('should maintain statistical distribution over many rolls', () => {
      const results: number[] = [];
      
      // Roll 1000 d6s
      for (let i = 0; i < 1000; i++) {
        results.push(rollDice('d6'));
      }
      
      // Check that we get roughly equal distribution
      const counts = Array(6).fill(0);
      results.forEach(roll => counts[roll - 1]++);
      
      // Each face should appear roughly 1/6 of the time (allow some variance)
      counts.forEach(count => {
        expect(count).toBeGreaterThan(100); // At least 10% of rolls
        expect(count).toBeLessThan(250);    // At most 25% of rolls
      });
    });
  });
});