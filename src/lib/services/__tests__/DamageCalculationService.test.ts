import { DamageCalculationService } from '../DamageCalculationService';
import { DamageCalculationServiceError } from '../DamageCalculationServiceErrors';
import {
  DamageCalculationInput,
  DamageType,
  ResistanceType
} from '../../utils/dice/damage-types';

describe('DamageCalculationService', () => {
  let service: DamageCalculationService;

  beforeEach(() => {
    service = new DamageCalculationService();
  });

  describe('calculateDamage', () => {
    it('should calculate basic damage correctly', () => {
      const input: DamageCalculationInput = {
        diceCount: 2,
        diceType: 'd6',
        modifier: 3,
        damageType: 'slashing'
      };

      const result = service.calculateDamage(input);

      expect(result.modifier).toBe(3);
      expect(result.damageType).toBe('slashing');
      expect(result.diceRolls).toHaveLength(2);
      expect(result.totalDamage).toBeGreaterThanOrEqual(5); // 2 + 3 minimum
      expect(result.totalDamage).toBeLessThanOrEqual(15); // 12 + 3 maximum
    });

    it('should validate input parameters', () => {
      const invalidInput: DamageCalculationInput = {
        diceCount: -1,
        diceType: 'd6',
        modifier: 0,
        damageType: 'slashing'
      };

      expect(() => service.calculateDamage(invalidInput))
        .toThrow(DamageCalculationServiceError);
    });

    it('should handle edge cases', () => {
      const edgeInput: DamageCalculationInput = {
        diceCount: 0,
        diceType: 'd4',
        modifier: -10,
        damageType: 'bludgeoning'
      };

      const result = service.calculateDamage(edgeInput);
      expect(result.totalDamage).toBe(0); // Should not go below 0
    });
  });

  describe('calculateDamageWithResistance', () => {
    it('should apply resistance correctly', () => {
      const baseDamage = {
        totalDamage: 20,
        diceRolls: [6, 6, 8],
        modifier: 0,
        damageType: 'fire' as DamageType
      };

      const result = service.calculateDamageWithResistance(baseDamage, 'resistant');
      expect(result.finalDamage).toBe(10);
      expect(result.resistanceApplied).toBe('resistant');
      expect(result.originalDamage).toBe(20);
    });

    it('should handle vulnerability', () => {
      const baseDamage = {
        totalDamage: 15,
        diceRolls: [6, 6, 3],
        modifier: 0,
        damageType: 'cold' as DamageType
      };

      const result = service.calculateDamageWithResistance(baseDamage, 'vulnerable');
      expect(result.finalDamage).toBe(30);
    });

    it('should handle immunity', () => {
      const baseDamage = {
        totalDamage: 25,
        diceRolls: [6, 6, 6, 7],
        modifier: 0,
        damageType: 'poison' as DamageType
      };

      const result = service.calculateDamageWithResistance(baseDamage, 'immune');
      expect(result.finalDamage).toBe(0);
    });
  });

  describe('calculateCriticalDamage', () => {
    it('should double dice but not modifier', () => {
      const input: DamageCalculationInput = {
        diceCount: 2,
        diceType: 'd6',
        modifier: 5,
        damageType: 'slashing'
      };

      const result = service.calculateCriticalDamage(input);

      expect(result.isCritical).toBe(true);
      expect(result.diceRolls).toHaveLength(4); // 2 * 2
      expect(result.modifier).toBe(5);
      expect(result.totalDamage).toBeGreaterThanOrEqual(9); // 4 + 5 minimum
      expect(result.totalDamage).toBeLessThanOrEqual(29); // 24 + 5 maximum
    });
  });

  describe('getPresetByName', () => {
    it('should return correct preset', () => {
      const preset = service.getPresetByName('shortsword');

      expect(preset).toBeDefined();
      expect(preset?.name).toBe('Shortsword');
      expect(preset?.diceType).toBe('d6');
      expect(preset?.damageType).toBe('piercing');
    });

    it('should return undefined for non-existent preset', () => {
      const preset = service.getPresetByName('nonexistent');
      expect(preset).toBeUndefined();
    });
  });

  describe('getAllPresets', () => {
    it('should return all available presets', () => {
      const presets = service.getAllPresets();

      expect(presets.length).toBeGreaterThan(0);
      expect(presets.some(p => p.name === 'Shortsword')).toBe(true);
      expect(presets.some(p => p.name === 'Fireball')).toBe(true);
    });
  });

  describe('getPresetsByTag', () => {
    it('should filter presets by tag', () => {
      const weaponPresets = service.getPresetsByTag('weapon');

      expect(weaponPresets.length).toBeGreaterThan(0);
      weaponPresets.forEach(preset => {
        expect(preset.tags).toContain('weapon');
      });
    });

    it('should return empty array for non-existent tag', () => {
      const presets = service.getPresetsByTag('nonexistent');
      expect(presets).toHaveLength(0);
    });
  });

  describe('calculateDamageFromPreset', () => {
    it('should calculate damage using preset', () => {
      const result = service.calculateDamageFromPreset('shortsword', 3);

      expect(result.damageType).toBe('piercing');
      expect(result.modifier).toBe(3); // Override preset modifier
      expect(result.diceRolls).toHaveLength(1);
    });

    it('should throw error for non-existent preset', () => {
      expect(() => service.calculateDamageFromPreset('nonexistent'))
        .toThrow(DamageCalculationServiceError);
    });

    it('should use preset modifier when none provided', () => {
      const result = service.calculateDamageFromPreset('magic-missile');
      expect(result.modifier).toBe(1); // Magic missile has +1 modifier
    });
  });

  describe('distributeDamageToTargets', () => {
    it('should distribute damage to multiple targets', () => {
      const baseDamage = {
        totalDamage: 20,
        diceRolls: [6, 6, 8],
        modifier: 0,
        damageType: 'fire' as DamageType
      };

      const targets = [
        { id: '1', name: 'Goblin 1', resistanceType: 'normal' as ResistanceType },
        { id: '2', name: 'Fire Elemental', resistanceType: 'immune' as ResistanceType }
      ];

      const results = service.distributeDamageToTargets(baseDamage, targets, 'equal');

      expect(results).toHaveLength(2);
      expect(results[0].finalDamage).toBe(20);
      expect(results[1].finalDamage).toBe(0); // Immune to fire
    });
  });

  describe('getDamageStatistics', () => {
    it('should calculate damage statistics', () => {
      const input: DamageCalculationInput = {
        diceCount: 2,
        diceType: 'd6',
        modifier: 3,
        damageType: 'slashing'
      };

      const stats = service.getDamageStatistics(input);

      expect(stats.minimum).toBe(5); // 2 + 3
      expect(stats.maximum).toBe(15); // 12 + 3
      expect(stats.average).toBe(10); // 7 + 3
      expect(stats.expectedDamage).toBe(10);
    });

    it('should handle zero dice', () => {
      const input: DamageCalculationInput = {
        diceCount: 0,
        diceType: 'd6',
        modifier: 5,
        damageType: 'force'
      };

      const stats = service.getDamageStatistics(input);

      expect(stats.minimum).toBe(5);
      expect(stats.maximum).toBe(5);
      expect(stats.average).toBe(5);
    });
  });

  describe('validation', () => {
    it('should validate dice count', () => {
      const invalidInput: DamageCalculationInput = {
        diceCount: 101, // Too many dice
        diceType: 'd6',
        modifier: 0,
        damageType: 'slashing'
      };

      expect(() => service.calculateDamage(invalidInput))
        .toThrow(DamageCalculationServiceError);
    });

    it('should validate modifier range', () => {
      const invalidInput: DamageCalculationInput = {
        diceCount: 1,
        diceType: 'd6',
        modifier: 1000, // Too high
        damageType: 'slashing'
      };

      expect(() => service.calculateDamage(invalidInput))
        .toThrow(DamageCalculationServiceError);
    });
  });
});