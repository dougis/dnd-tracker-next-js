import {
  calculateAbilityModifier,
  calculateInitiativeModifier,
  rollD20,
  isValidEmail,
} from '../lib/utils';

describe('calculateAbilityModifier', () => {
  it('should calculate correct modifiers for various scores', () => {
    expect(calculateAbilityModifier(10)).toBe(0);
    expect(calculateAbilityModifier(8)).toBe(-1);
    expect(calculateAbilityModifier(12)).toBe(1);
    expect(calculateAbilityModifier(20)).toBe(5);
    expect(calculateAbilityModifier(3)).toBe(-4);
    expect(calculateAbilityModifier(30)).toBe(10);
  });

  it('should throw error for invalid scores', () => {
    expect(() => calculateAbilityModifier(0)).toThrow(
      'Ability score must be between 1 and 30'
    );
    expect(() => calculateAbilityModifier(31)).toThrow(
      'Ability score must be between 1 and 30'
    );
    expect(() => calculateAbilityModifier(-1)).toThrow(
      'Ability score must be between 1 and 30'
    );
  });
});

describe('calculateInitiativeModifier', () => {
  it('should calculate initiative modifier with dexterity only', () => {
    expect(calculateInitiativeModifier(10)).toBe(0); // Dex 10 = +0
    expect(calculateInitiativeModifier(14)).toBe(2); // Dex 14 = +2
    expect(calculateInitiativeModifier(8)).toBe(-1); // Dex 8 = -1
  });

  it('should calculate initiative modifier with bonus', () => {
    expect(calculateInitiativeModifier(10, 2)).toBe(2); // Dex +0, bonus +2
    expect(calculateInitiativeModifier(14, 1)).toBe(3); // Dex +2, bonus +1
    expect(calculateInitiativeModifier(8, -1)).toBe(-2); // Dex -1, bonus -1
  });
});

describe('rollD20', () => {
  it('should return a value between 1 and 20 (no modifier)', () => {
    // Mock Math.random to return 0 (minimum)
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(rollD20()).toBe(1);

    // Mock Math.random to return 0.999... (maximum)
    mockRandom.mockReturnValue(0.999);
    expect(rollD20()).toBe(20);

    mockRandom.mockRestore();
  });

  it('should add modifier correctly', () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5); // Roll 11
    expect(rollD20(5)).toBe(16); // 11 + 5
    expect(rollD20(-2)).toBe(9); // 11 - 2

    mockRandom.mockRestore();
  });
});

describe('isValidEmail', () => {
  it('should validate correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
