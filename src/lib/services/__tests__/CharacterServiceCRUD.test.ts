/**
 * Character Service CRUD Tests
 *
 * Basic tests for CRUD operations to improve coverage
 */

jest.mock('../../models/Character', () => ({
  Character: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock('../utils/CharacterValidationUtils', () => ({
  CharacterValidationUtils: {
    validateMultipleObjectIds: jest.fn(),
    validateCharacterData: jest.fn(),
  },
}));

jest.mock('../utils/CharacterAccessUtils', () => ({
  CharacterAccessUtils: {
    checkAccess: jest.fn(),
    checkOwnership: jest.fn(),
  },
}));

import { CharacterServiceCRUD } from '../CharacterServiceCRUD';
import { createMockCharacterData } from './CharacterService.test-helpers';

describe('CharacterServiceCRUD', () => {
  const validUserId = '507f1f77bcf86cd799439012';
  const validCharacterId = '507f1f77bcf86cd799439011';
  const mockCharacterData = createMockCharacterData();

  beforeEach(() => {
    jest.clearAllMocks();

    const { CharacterValidationUtils } = require('../utils/CharacterValidationUtils');
    const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');

    CharacterValidationUtils.validateMultipleObjectIds.mockReturnValue({ success: true });
    CharacterValidationUtils.validateCharacterData.mockReturnValue({
      success: true,
      data: mockCharacterData,
    });

    CharacterAccessUtils.checkAccess.mockResolvedValue({
      success: true,
      data: { _id: validCharacterId, ...mockCharacterData },
    });
    CharacterAccessUtils.checkOwnership.mockResolvedValue({
      success: true,
      data: { _id: validCharacterId, ...mockCharacterData },
    });
  });

  describe('createCharacter', () => {
    it('should create character successfully', async () => {
      const { Character } = require('../../models/Character');
      Character.create.mockResolvedValue({ _id: validCharacterId, ...mockCharacterData });

      const result = await CharacterServiceCRUD.createCharacter(validUserId, mockCharacterData);
      expect(result.success).toBe(true);
      expect(Character.create).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const { CharacterValidationUtils } = require('../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateCharacterData.mockReturnValue({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Invalid character data' },
      });

      const result = await CharacterServiceCRUD.createCharacter(validUserId, mockCharacterData);
      expect(result.success).toBe(false);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../models/Character');
      Character.create.mockRejectedValue(new Error('Database error'));

      const result = await CharacterServiceCRUD.createCharacter(validUserId, mockCharacterData);
      expect(result.success).toBe(false);
    });
  });

  describe('getCharacterById', () => {
    it('should get character successfully', async () => {
      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);
      expect(result.success).toBe(true);
    });

    it('should handle validation errors', async () => {
      const { CharacterValidationUtils } = require('../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateMultipleObjectIds.mockReturnValue({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid ID' },
      });

      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);
      expect(result.success).toBe(false);
    });

    it('should handle access errors', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkAccess.mockResolvedValue({
        success: false,
        error: { code: 'NO_ACCESS', message: 'No access' },
      });

      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);
      expect(result.success).toBe(false);
    });
  });

  describe('updateCharacter', () => {
    it('should update character successfully', async () => {
      const { Character } = require('../../models/Character');
      Character.findByIdAndUpdate.mockResolvedValue({ _id: validCharacterId, name: 'Updated' });

      const result = await CharacterServiceCRUD.updateCharacter(
        validCharacterId,
        validUserId,
        { name: 'Updated' }
      );
      expect(result.success).toBe(true);
    });

    it('should handle ownership check failures', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkOwnership.mockResolvedValue({
        success: false,
        error: { code: 'NOT_OWNER', message: 'Not owner' },
      });

      const result = await CharacterServiceCRUD.updateCharacter(
        validCharacterId,
        validUserId,
        { name: 'Updated' }
      );
      expect(result.success).toBe(false);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../models/Character');
      Character.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const result = await CharacterServiceCRUD.updateCharacter(
        validCharacterId,
        validUserId,
        { name: 'Updated' }
      );
      expect(result.success).toBe(false);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character successfully', async () => {
      const { Character } = require('../../models/Character');
      Character.findByIdAndDelete.mockResolvedValue({ _id: validCharacterId });

      const result = await CharacterServiceCRUD.deleteCharacter(validCharacterId, validUserId);
      expect(result.success).toBe(true);
    });

    it('should handle ownership check failures', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkOwnership.mockResolvedValue({
        success: false,
        error: { code: 'NOT_OWNER', message: 'Not owner' },
      });

      const result = await CharacterServiceCRUD.deleteCharacter(validCharacterId, validUserId);
      expect(result.success).toBe(false);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../models/Character');
      Character.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const result = await CharacterServiceCRUD.deleteCharacter(validCharacterId, validUserId);
      expect(result.success).toBe(false);
    });
  });
});