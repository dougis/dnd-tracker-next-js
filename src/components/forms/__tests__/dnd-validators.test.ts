import { dndValidators } from '../form-utils';

describe('D&D Validators', () => {
  describe('characterName', () => {
    it('should have correct validation rules', () => {
      const validators = dndValidators.characterName;

      expect(validators).toHaveLength(3);
      expect(validators[0].message).toBe('Character name is required');
      expect(validators[1].message).toBe('Character name must be at least 2 characters');
      expect(validators[2].message).toBe('Character name must be no more than 50 characters');
    });

    it('should validate character names correctly', () => {
      const validators = dndValidators.characterName;

      // Valid names
      expect(validators[0].test('Aragorn')).toBe(true);
      expect(validators[1].test('Aragorn')).toBe(true);
      expect(validators[2].test('Aragorn')).toBe(true);

      // Invalid names
      expect(validators[0].test('')).toBe(false); // Required
      expect(validators[1].test('A')).toBe(false); // Too short
      expect(validators[2].test('A'.repeat(51))).toBe(false); // Too long
    });
  });

  describe('abilityScore', () => {
    it('should have correct validation rules', () => {
      const validators = dndValidators.abilityScore;

      expect(validators).toHaveLength(4);
      expect(validators[0].message).toBe('Ability score is required');
      expect(validators[1].message).toBe('Ability score must be a number');
      expect(validators[2].message).toBe('Ability score must be at least 1');
      expect(validators[3].message).toBe('Ability score cannot exceed 30');
    });

    it('should validate ability scores correctly', () => {
      const validators = dndValidators.abilityScore;

      // Valid scores
      expect(validators[1].test(15)).toBe(true);
      expect(validators[2].test(15)).toBe(true);
      expect(validators[3].test(15)).toBe(true);

      // Invalid scores
      expect(validators[1].test('not-a-number')).toBe(false);
      expect(validators[2].test(0)).toBe(false);
      expect(validators[3].test(35)).toBe(false);
    });
  });

  describe('hitPoints', () => {
    it('should have correct validation rules', () => {
      const validators = dndValidators.hitPoints;

      expect(validators).toHaveLength(4);
      expect(validators[0].message).toBe('Hit points are required');
      expect(validators[1].message).toBe('Hit points must be a number');
      expect(validators[2].message).toBe('Hit points cannot be negative');
      expect(validators[3].message).toBe('Hit points cannot exceed 9999');
    });

    it('should validate hit points correctly', () => {
      const validators = dndValidators.hitPoints;

      // Valid HP
      expect(validators[1].test(50)).toBe(true);
      expect(validators[2].test(0)).toBe(true); // Zero HP allowed
      expect(validators[3].test(100)).toBe(true);

      // Invalid HP
      expect(validators[2].test(-5)).toBe(false);
      expect(validators[3].test(10000)).toBe(false);
    });
  });

  describe('armorClass', () => {
    it('should have correct validation rules', () => {
      const validators = dndValidators.armorClass;

      expect(validators).toHaveLength(4);
      expect(validators[0].message).toBe('Armor class is required');
      expect(validators[1].message).toBe('Armor class must be a number');
      expect(validators[2].message).toBe('Armor class must be at least 1');
      expect(validators[3].message).toBe('Armor class cannot exceed 30');
    });

    it('should validate armor class correctly', () => {
      const validators = dndValidators.armorClass;

      // Valid AC
      expect(validators[1].test(15)).toBe(true);
      expect(validators[2].test(10)).toBe(true);
      expect(validators[3].test(20)).toBe(true);

      // Invalid AC
      expect(validators[2].test(0)).toBe(false);
      expect(validators[3].test(35)).toBe(false);
    });
  });

  describe('initiative', () => {
    it('should have correct validation rules', () => {
      const validators = dndValidators.initiative;

      expect(validators).toHaveLength(3);
      expect(validators[0].message).toBe('Initiative must be a number');
      expect(validators[1].message).toBe('Initiative modifier cannot be less than -10');
      expect(validators[2].message).toBe('Initiative modifier cannot exceed +20');
    });

    it('should validate initiative correctly', () => {
      const validators = dndValidators.initiative;

      // Valid initiative
      expect(validators[0].test(5)).toBe(true);
      expect(validators[1].test(-5)).toBe(true);
      expect(validators[2].test(10)).toBe(true);

      // Invalid initiative
      expect(validators[1].test(-15)).toBe(false);
      expect(validators[2].test(25)).toBe(false);
    });
  });

  describe('level', () => {
    it('should have correct validation rules', () => {
      const validators = dndValidators.level;

      expect(validators).toHaveLength(4);
      expect(validators[0].message).toBe('Level is required');
      expect(validators[1].message).toBe('Level must be a number');
      expect(validators[2].message).toBe('Level must be at least 1');
      expect(validators[3].message).toBe('Level cannot exceed 20');
    });

    it('should validate level correctly', () => {
      const validators = dndValidators.level;

      // Valid levels
      expect(validators[1].test(10)).toBe(true);
      expect(validators[2].test(1)).toBe(true);
      expect(validators[3].test(20)).toBe(true);

      // Invalid levels
      expect(validators[2].test(0)).toBe(false);
      expect(validators[3].test(21)).toBe(false);
    });
  });
});
