/**
 * @jest-environment node
 */

import {
  DND_VALIDATION_RANGES,
  commonFields,
  dndFields,
  hitPointsUtils,
  validationHelpers,
  commonIndexes,
  type IHitPoints,
} from '../schema-utils';

describe('DND_VALIDATION_RANGES', () => {
  it('should have correct ability score ranges', () => {
    expect(DND_VALIDATION_RANGES.ABILITY_SCORE).toEqual({ min: 1, max: 30 });
  });

  it('should have correct armor class ranges', () => {
    expect(DND_VALIDATION_RANGES.ARMOR_CLASS).toEqual({ min: 1, max: 30 });
  });

  it('should have correct initiative ranges', () => {
    expect(DND_VALIDATION_RANGES.INITIATIVE).toEqual({ min: -10, max: 30 });
  });

  it('should have correct character level ranges', () => {
    expect(DND_VALIDATION_RANGES.CHARACTER_LEVEL).toEqual({ min: 1, max: 20 });
  });

  it('should have correct spell level ranges', () => {
    expect(DND_VALIDATION_RANGES.SPELL_LEVEL).toEqual({ min: 0, max: 9 });
  });

  it('should have correct hit points ranges', () => {
    expect(DND_VALIDATION_RANGES.HIT_POINTS).toEqual({ min: 0 });
    expect(DND_VALIDATION_RANGES.HIT_POINTS_MAX).toEqual({ min: 1 });
  });
});

describe('commonFields', () => {
  it('should have properly configured name field', () => {
    expect(commonFields.name).toEqual({
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    });
  });

  it('should have properly configured description field', () => {
    expect(commonFields.description).toEqual({
      type: String,
      default: '',
      maxlength: 1000,
    });
  });

  it('should have properly configured notes field', () => {
    expect(commonFields.notes).toEqual({
      type: String,
      default: '',
      maxlength: 500,
    });
  });

  it('should have properly configured isPublic field', () => {
    expect(commonFields.isPublic).toEqual({
      type: Boolean,
      default: false,
      index: true,
    });
  });

  it('should have imageUrl field with validation', () => {
    expect(commonFields.imageUrl.type).toBe(String);
    expect(commonFields.imageUrl.maxlength).toBe(500);
    expect(commonFields.imageUrl.validate).toBeDefined();
  });

  it('should have tags field with proper validation', () => {
    expect(commonFields.tags.type).toEqual([String]);
    expect(commonFields.tags.default).toEqual([]);
    expect(commonFields.tags.validate).toBeDefined();
  });
});

describe('dndFields', () => {
  it('should have armor class field with proper validation', () => {
    expect(dndFields.armorClass).toEqual({
      type: Number,
      required: true,
      min: 1,
      max: 30,
    });
  });

  it('should have initiative field with proper validation', () => {
    expect(dndFields.initiative).toEqual({
      type: Number,
      min: -10,
      max: 30,
    });
  });

  it('should have character level field', () => {
    expect(dndFields.characterLevel).toEqual({
      type: Number,
      required: true,
      min: 1,
      max: 20,
    });
  });

  it('should have target level field with index', () => {
    expect(dndFields.targetLevel).toEqual({
      type: Number,
      min: 1,
      max: 20,
      index: true,
    });
  });

  it('should have spell level field', () => {
    expect(dndFields.spellLevel).toEqual({
      type: Number,
      required: true,
      min: 0,
      max: 9,
    });
  });
});

describe('hitPointsUtils', () => {
  let hitPoints: IHitPoints;

  beforeEach(() => {
    hitPoints = {
      maximum: 20,
      current: 15,
      temporary: 5,
    };
  });

  describe('getEffectiveHP', () => {
    it('should return current + temporary HP', () => {
      expect(hitPointsUtils.getEffectiveHP(hitPoints)).toBe(20);
    });

    it('should handle zero temporary HP', () => {
      hitPoints.temporary = 0;
      expect(hitPointsUtils.getEffectiveHP(hitPoints)).toBe(15);
    });
  });

  describe('isAlive', () => {
    it('should return true when current HP > 0', () => {
      expect(hitPointsUtils.isAlive(hitPoints)).toBe(true);
    });

    it('should return false when current HP = 0', () => {
      hitPoints.current = 0;
      expect(hitPointsUtils.isAlive(hitPoints)).toBe(false);
    });

    it('should return false when current HP < 0', () => {
      hitPoints.current = -5;
      expect(hitPointsUtils.isAlive(hitPoints)).toBe(false);
    });
  });

  describe('isUnconscious', () => {
    it('should return false when current HP > 0', () => {
      expect(hitPointsUtils.isUnconscious(hitPoints)).toBe(false);
    });

    it('should return true when current HP = 0', () => {
      hitPoints.current = 0;
      expect(hitPointsUtils.isUnconscious(hitPoints)).toBe(true);
    });

    it('should return true when current HP < 0', () => {
      hitPoints.current = -5;
      expect(hitPointsUtils.isUnconscious(hitPoints)).toBe(true);
    });
  });

  describe('takeDamage', () => {
    it('should apply damage to temporary HP first', () => {
      hitPointsUtils.takeDamage(hitPoints, 3);
      expect(hitPoints.temporary).toBe(2);
      expect(hitPoints.current).toBe(15);
    });

    it('should apply excess damage to current HP', () => {
      hitPointsUtils.takeDamage(hitPoints, 8);
      expect(hitPoints.temporary).toBe(0);
      expect(hitPoints.current).toBe(12);
    });

    it('should not reduce current HP below 0', () => {
      hitPointsUtils.takeDamage(hitPoints, 30);
      expect(hitPoints.current).toBe(0);
      expect(hitPoints.temporary).toBe(0);
    });

    it('should handle zero damage', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.takeDamage(hitPoints, 0);
      expect(hitPoints).toEqual(originalHP);
    });

    it('should handle negative damage', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.takeDamage(hitPoints, -5);
      expect(hitPoints).toEqual(originalHP);
    });
  });

  describe('heal', () => {
    it('should heal current HP', () => {
      hitPointsUtils.heal(hitPoints, 3);
      expect(hitPoints.current).toBe(18);
    });

    it('should not exceed maximum HP', () => {
      hitPointsUtils.heal(hitPoints, 10);
      expect(hitPoints.current).toBe(20);
    });

    it('should handle zero healing', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.heal(hitPoints, 0);
      expect(hitPoints).toEqual(originalHP);
    });

    it('should handle negative healing', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.heal(hitPoints, -5);
      expect(hitPoints).toEqual(originalHP);
    });
  });

  describe('addTemporaryHP', () => {
    it('should add temporary HP when higher than current', () => {
      hitPointsUtils.addTemporaryHP(hitPoints, 8);
      expect(hitPoints.temporary).toBe(8);
    });

    it('should not add temporary HP when lower than current', () => {
      hitPointsUtils.addTemporaryHP(hitPoints, 3);
      expect(hitPoints.temporary).toBe(5);
    });

    it('should handle zero temporary HP', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.addTemporaryHP(hitPoints, 0);
      expect(hitPoints).toEqual(originalHP);
    });

    it('should handle negative temporary HP', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.addTemporaryHP(hitPoints, -5);
      expect(hitPoints).toEqual(originalHP);
    });
  });

  describe('setMaximumHP', () => {
    it('should set new maximum HP', () => {
      hitPointsUtils.setMaximumHP(hitPoints, 25);
      expect(hitPoints.maximum).toBe(25);
    });

    it('should adjust current HP if it exceeds new maximum', () => {
      hitPointsUtils.setMaximumHP(hitPoints, 10);
      expect(hitPoints.maximum).toBe(10);
      expect(hitPoints.current).toBe(10);
    });

    it('should not change current HP if within new maximum', () => {
      hitPointsUtils.setMaximumHP(hitPoints, 25);
      expect(hitPoints.current).toBe(15);
    });

    it('should handle invalid maximum HP', () => {
      const originalHP = { ...hitPoints };
      hitPointsUtils.setMaximumHP(hitPoints, 0);
      expect(hitPoints).toEqual(originalHP);
    });
  });
});

describe('validationHelpers', () => {
  describe('isValidAbilityScore', () => {
    it('should validate valid ability scores', () => {
      expect(validationHelpers.isValidAbilityScore(1)).toBe(true);
      expect(validationHelpers.isValidAbilityScore(15)).toBe(true);
      expect(validationHelpers.isValidAbilityScore(30)).toBe(true);
    });

    it('should reject invalid ability scores', () => {
      expect(validationHelpers.isValidAbilityScore(0)).toBe(false);
      expect(validationHelpers.isValidAbilityScore(31)).toBe(false);
      expect(validationHelpers.isValidAbilityScore(10.5)).toBe(false);
    });
  });

  describe('getAbilityModifier', () => {
    it('should calculate correct ability modifiers', () => {
      expect(validationHelpers.getAbilityModifier(1)).toBe(-5);
      expect(validationHelpers.getAbilityModifier(10)).toBe(0);
      expect(validationHelpers.getAbilityModifier(11)).toBe(0);
      expect(validationHelpers.getAbilityModifier(12)).toBe(1);
      expect(validationHelpers.getAbilityModifier(20)).toBe(5);
      expect(validationHelpers.getAbilityModifier(30)).toBe(10);
    });
  });

  describe('isValidCharacterLevel', () => {
    it('should validate valid character levels', () => {
      expect(validationHelpers.isValidCharacterLevel(1)).toBe(true);
      expect(validationHelpers.isValidCharacterLevel(10)).toBe(true);
      expect(validationHelpers.isValidCharacterLevel(20)).toBe(true);
    });

    it('should reject invalid character levels', () => {
      expect(validationHelpers.isValidCharacterLevel(0)).toBe(false);
      expect(validationHelpers.isValidCharacterLevel(21)).toBe(false);
      expect(validationHelpers.isValidCharacterLevel(10.5)).toBe(false);
    });
  });

  describe('isValidArmorClass', () => {
    it('should validate valid armor class values', () => {
      expect(validationHelpers.isValidArmorClass(1)).toBe(true);
      expect(validationHelpers.isValidArmorClass(15)).toBe(true);
      expect(validationHelpers.isValidArmorClass(30)).toBe(true);
    });

    it('should reject invalid armor class values', () => {
      expect(validationHelpers.isValidArmorClass(0)).toBe(false);
      expect(validationHelpers.isValidArmorClass(31)).toBe(false);
      expect(validationHelpers.isValidArmorClass(15.5)).toBe(false);
    });
  });

  describe('isValidInitiative', () => {
    it('should validate valid initiative values', () => {
      expect(validationHelpers.isValidInitiative(-10)).toBe(true);
      expect(validationHelpers.isValidInitiative(0)).toBe(true);
      expect(validationHelpers.isValidInitiative(15)).toBe(true);
      expect(validationHelpers.isValidInitiative(30)).toBe(true);
    });

    it('should reject invalid initiative values', () => {
      expect(validationHelpers.isValidInitiative(-11)).toBe(false);
      expect(validationHelpers.isValidInitiative(31)).toBe(false);
      expect(validationHelpers.isValidInitiative(15.5)).toBe(false);
    });
  });

  describe('isValidSpellLevel', () => {
    it('should validate valid spell levels', () => {
      expect(validationHelpers.isValidSpellLevel(0)).toBe(true);
      expect(validationHelpers.isValidSpellLevel(5)).toBe(true);
      expect(validationHelpers.isValidSpellLevel(9)).toBe(true);
    });

    it('should reject invalid spell levels', () => {
      expect(validationHelpers.isValidSpellLevel(-1)).toBe(false);
      expect(validationHelpers.isValidSpellLevel(10)).toBe(false);
      expect(validationHelpers.isValidSpellLevel(5.5)).toBe(false);
    });
  });

  describe('isValidHitDie', () => {
    it('should validate valid hit die values', () => {
      expect(validationHelpers.isValidHitDie(4)).toBe(true);
      expect(validationHelpers.isValidHitDie(6)).toBe(true);
      expect(validationHelpers.isValidHitDie(8)).toBe(true);
      expect(validationHelpers.isValidHitDie(10)).toBe(true);
      expect(validationHelpers.isValidHitDie(12)).toBe(true);
    });

    it('should reject invalid hit die values', () => {
      expect(validationHelpers.isValidHitDie(3)).toBe(false);
      expect(validationHelpers.isValidHitDie(5)).toBe(false);
      expect(validationHelpers.isValidHitDie(20)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate valid URLs', () => {
      expect(validationHelpers.isValidUrl('https://example.com')).toBe(true);
      expect(validationHelpers.isValidUrl('http://example.com')).toBe(true);
      expect(validationHelpers.isValidUrl('')).toBe(true); // Empty URL is allowed
    });

    it('should reject invalid URLs', () => {
      expect(validationHelpers.isValidUrl('ftp://example.com')).toBe(false);
      expect(validationHelpers.isValidUrl('not-a-url')).toBe(false);
      expect(validationHelpers.isValidUrl('www.example.com')).toBe(false);
    });
  });

  describe('isValidTagArray', () => {
    it('should validate valid tag arrays', () => {
      expect(validationHelpers.isValidTagArray([])).toBe(true);
      expect(validationHelpers.isValidTagArray(['tag1', 'tag2'])).toBe(true);
      expect(validationHelpers.isValidTagArray(['a'.repeat(30)])).toBe(true);
    });

    it('should reject invalid tag arrays', () => {
      expect(validationHelpers.isValidTagArray(['a'.repeat(31)])).toBe(false);
      expect(validationHelpers.isValidTagArray(new Array(11).fill('tag'))).toBe(false);
      expect(validationHelpers.isValidTagArray(['tag', 123] as any)).toBe(false);
    });
  });
});

describe('commonIndexes', () => {
  let mockSchema: any;

  beforeEach(() => {
    mockSchema = {
      index: jest.fn(),
    };
  });

  it('should apply owner-based indexes', () => {
    commonIndexes.ownerBased(mockSchema);
    expect(mockSchema.index).toHaveBeenCalledWith({ ownerId: 1, name: 1 });
    expect(mockSchema.index).toHaveBeenCalledWith({ ownerId: 1, updatedAt: -1 });
    expect(mockSchema.index).toHaveBeenCalledWith({ ownerId: 1, isDeleted: 1 });
  });

  it('should apply public content indexes', () => {
    commonIndexes.publicContent(mockSchema);
    expect(mockSchema.index).toHaveBeenCalledWith({ isPublic: 1, updatedAt: -1 });
    expect(mockSchema.index).toHaveBeenCalledWith({ isPublic: 1, name: 1 });
  });

  it('should apply temporal indexes', () => {
    commonIndexes.temporal(mockSchema);
    expect(mockSchema.index).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockSchema.index).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockSchema.index).toHaveBeenCalledWith({ deletedAt: 1 }, { sparse: true });
  });

  it('should apply D&D content indexes', () => {
    commonIndexes.dndContent(mockSchema);
    expect(mockSchema.index).toHaveBeenCalledWith({ type: 1, isPublic: 1 });
    expect(mockSchema.index).toHaveBeenCalledWith({ tags: 1 });
  });
});