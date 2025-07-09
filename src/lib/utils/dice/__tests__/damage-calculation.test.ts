import {
  calculateDamage,
  calculateDamageWithResistance,
  calculateCriticalDamage,
  distributeDamageToMultipleTargets,
  DamageCalculationResult,
  DamageDistributionTarget
} from '../damage-calculation';

describe('damage-calculation', () => {
  describe('calculateDamage', () => {
    it('should calculate basic damage with dice and modifier', () => {
      // Mock Math.random to return predictable values
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.5) // d6 = 4
        .mockReturnValueOnce(0.8); // d6 = 5

      const result = calculateDamage({
        diceCount: 2,
        diceType: 'd6',
        modifier: 3,
        damageType: 'slashing'
      });

      expect(result.totalDamage).toBe(12); // 4 + 5 + 3
      expect(result.diceRolls).toEqual([4, 5]);
      expect(result.modifier).toBe(3);
      expect(result.damageType).toBe('slashing');

      Math.random = originalRandom;
    });

    it('should handle no modifier', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // d8 = 8

      const result = calculateDamage({
        diceCount: 1,
        diceType: 'd8',
        modifier: 0,
        damageType: 'fire'
      });

      expect(result.totalDamage).toBe(8);
      expect(result.modifier).toBe(0);

      Math.random = originalRandom;
    });

    it('should handle negative modifier', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // d4 = 4

      const result = calculateDamage({
        diceCount: 1,
        diceType: 'd4',
        modifier: -2,
        damageType: 'cold'
      });

      expect(result.totalDamage).toBe(2); // 4 - 2
      expect(result.modifier).toBe(-2);

      Math.random = originalRandom;
    });
  });

  describe('calculateDamageWithResistance', () => {
    it('should halve damage for resistance', () => {
      const baseDamage: DamageCalculationResult = {
        totalDamage: 20,
        diceRolls: [6, 6, 8],
        modifier: 0,
        damageType: 'fire'
      };

      const result = calculateDamageWithResistance(baseDamage, 'resistant');
      expect(result.finalDamage).toBe(10);
      expect(result.resistanceApplied).toBe('resistant');
    });

    it('should double damage for vulnerability', () => {
      const baseDamage: DamageCalculationResult = {
        totalDamage: 15,
        diceRolls: [6, 6, 3],
        modifier: 0,
        damageType: 'lightning'
      };

      const result = calculateDamageWithResistance(baseDamage, 'vulnerable');
      expect(result.finalDamage).toBe(30);
      expect(result.resistanceApplied).toBe('vulnerable');
    });

    it('should negate damage for immunity', () => {
      const baseDamage: DamageCalculationResult = {
        totalDamage: 25,
        diceRolls: [6, 6, 6, 7],
        modifier: 0,
        damageType: 'poison'
      };

      const result = calculateDamageWithResistance(baseDamage, 'immune');
      expect(result.finalDamage).toBe(0);
      expect(result.resistanceApplied).toBe('immune');
    });

    it('should not modify damage for normal resistance', () => {
      const baseDamage: DamageCalculationResult = {
        totalDamage: 18,
        diceRolls: [6, 6, 6],
        modifier: 0,
        damageType: 'bludgeoning'
      };

      const result = calculateDamageWithResistance(baseDamage, 'normal');
      expect(result.finalDamage).toBe(18);
      expect(result.resistanceApplied).toBe('normal');
    });
  });

  describe('calculateCriticalDamage', () => {
    it('should double dice rolls but not modifier', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.5) // First d8 = 5
        .mockReturnValueOnce(0.7) // Second d8 = 6
        .mockReturnValueOnce(0.3) // Additional d8 = 3
        .mockReturnValueOnce(0.9); // Additional d8 = 8

      const result = calculateCriticalDamage({
        diceCount: 2,
        diceType: 'd8',
        modifier: 4,
        damageType: 'slashing'
      });

      expect(result.totalDamage).toBe(26); // 5 + 6 + 3 + 8 + 4
      expect(result.diceRolls).toEqual([5, 6, 3, 8]);
      expect(result.modifier).toBe(4);
      expect(result.isCritical).toBe(true);

      Math.random = originalRandom;
    });
  });

  describe('distributeDamageToMultipleTargets', () => {
    it('should distribute equal damage to all targets', () => {
      const targets: DamageDistributionTarget[] = [
        { id: '1', name: 'Goblin 1', resistanceType: 'normal' },
        { id: '2', name: 'Goblin 2', resistanceType: 'normal' },
        { id: '3', name: 'Goblin 3', resistanceType: 'normal' }
      ];

      const baseDamage: DamageCalculationResult = {
        totalDamage: 18,
        diceRolls: [6, 6, 6],
        modifier: 0,
        damageType: 'fire'
      };

      const result = distributeDamageToMultipleTargets(baseDamage, targets, 'equal');

      expect(result.length).toBe(3);
      result.forEach(targetResult => {
        expect(targetResult.finalDamage).toBe(18);
        expect(targetResult.resistanceApplied).toBe('normal');
      });
    });

    it('should apply different resistance types correctly', () => {
      const targets: DamageDistributionTarget[] = [
        { id: '1', name: 'Fire Elemental', resistanceType: 'immune' },
        { id: '2', name: 'Ice Troll', resistanceType: 'vulnerable' },
        { id: '3', name: 'Stone Golem', resistanceType: 'resistant' }
      ];

      const baseDamage: DamageCalculationResult = {
        totalDamage: 20,
        diceRolls: [6, 6, 8],
        modifier: 0,
        damageType: 'fire'
      };

      const result = distributeDamageToMultipleTargets(baseDamage, targets, 'equal');

      expect(result[0].finalDamage).toBe(0); // immune
      expect(result[1].finalDamage).toBe(40); // vulnerable
      expect(result[2].finalDamage).toBe(10); // resistant
    });

    it('should handle half damage distribution', () => {
      const targets: DamageDistributionTarget[] = [
        { id: '1', name: 'Target 1', resistanceType: 'normal' },
        { id: '2', name: 'Target 2', resistanceType: 'normal' }
      ];

      const baseDamage: DamageCalculationResult = {
        totalDamage: 24,
        diceRolls: [6, 6, 6, 6],
        modifier: 0,
        damageType: 'thunder'
      };

      const result = distributeDamageToMultipleTargets(baseDamage, targets, 'half');

      result.forEach(targetResult => {
        expect(targetResult.finalDamage).toBe(12);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle minimum damage of 0', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0); // d4 = 1

      const result = calculateDamage({
        diceCount: 1,
        diceType: 'd4',
        modifier: -5,
        damageType: 'bludgeoning'
      });

      expect(result.totalDamage).toBe(0); // Math.max(0, 1 - 5)

      Math.random = originalRandom;
    });

    it('should handle maximum dice values', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.99); // d20 = 20

      const result = calculateDamage({
        diceCount: 1,
        diceType: 'd20',
        modifier: 10,
        damageType: 'force'
      });

      expect(result.totalDamage).toBe(30);

      Math.random = originalRandom;
    });
  });
});