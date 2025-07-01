/**
 * Character Service Stats Tests
 *
 * Basic tests for stats operations to improve coverage
 */

jest.mock('../utils/CharacterAccessUtils', () => ({
  CharacterAccessUtils: {
    checkAccess: jest.fn(),
  },
}));

import { CharacterServiceStats } from '../CharacterServiceStats';

describe('CharacterServiceStats', () => {
  const validUserId = '507f1f77bcf86cd799439012';
  const validCharacterId = '507f1f77bcf86cd799439011';
  const mockCharacter = {
    _id: validCharacterId,
    name: 'Test Character',
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    classes: [{ class: 'fighter', level: 1 }],
    race: 'human',
    equipment: [{ name: 'Chain Mail', weight: 55 }],
    level: 1,
    experiencePoints: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
    CharacterAccessUtils.checkAccess.mockResolvedValue({
      success: true,
      data: mockCharacter,
    });
  });

  describe('calculateCharacterStats', () => {
    it('should calculate character stats successfully', async () => {
      const result = await CharacterServiceStats.calculateCharacterStats(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('abilityModifiers');
    });

    it('should handle access check failures', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkAccess.mockResolvedValue({
        success: false,
        error: { code: 'NO_ACCESS', message: 'No access' },
      });

      const result = await CharacterServiceStats.calculateCharacterStats(validCharacterId, validUserId);
      expect(result.success).toBe(false);
    });
  });

  describe('getCharacterSummary', () => {
    it('should get character summary successfully', async () => {
      const result = await CharacterServiceStats.getCharacterSummary(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('name');
    });
  });

  describe('calculateSpellcastingStats', () => {
    it('should calculate spellcasting stats successfully', async () => {
      const result = await CharacterServiceStats.calculateSpellcastingStats(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('casterLevel');
    });
  });

  describe('calculateCarryingCapacity', () => {
    it('should calculate carrying capacity successfully', async () => {
      const result = await CharacterServiceStats.calculateCarryingCapacity(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('maximum');
    });
  });

  describe('calculateEquipmentWeight', () => {
    it('should calculate equipment weight successfully', async () => {
      const result = await CharacterServiceStats.calculateEquipmentWeight(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('total');
    });
  });

  describe('calculateExperienceInfo', () => {
    it('should calculate experience info successfully', async () => {
      const result = await CharacterServiceStats.calculateExperienceInfo(validCharacterId, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('currentLevel');
    });
  });
});