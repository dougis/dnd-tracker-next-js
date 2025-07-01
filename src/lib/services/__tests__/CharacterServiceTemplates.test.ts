/**
 * Character Service Templates Tests
 *
 * Basic tests for template operations to improve coverage
 */

jest.mock('../CharacterServiceCRUD', () => ({
  CharacterServiceCRUD: {
    createCharacter: jest.fn(),
    updateCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
  },
}));

jest.mock('../utils/CharacterAccessUtils', () => ({
  CharacterAccessUtils: {
    checkOwnership: jest.fn(),
    checkMultipleOwnership: jest.fn(),
  },
}));

jest.mock('../utils/CharacterValidationUtils', () => ({
  CharacterValidationUtils: {
    validateCharacterData: jest.fn(),
    validateObjectId: jest.fn(),
  },
}));

import { CharacterServiceTemplates } from '../CharacterServiceTemplates';
import { createMockCharacterData } from './CharacterService.test-helpers';

describe('CharacterServiceTemplates', () => {
  const validUserId = '507f1f77bcf86cd799439012';
  const validCharacterId = '507f1f77bcf86cd799439011';
  const mockCharacterData = createMockCharacterData();

  beforeEach(() => {
    jest.clearAllMocks();

    const { CharacterServiceCRUD } = require('../CharacterServiceCRUD');
    const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
    const { CharacterValidationUtils } = require('../utils/CharacterValidationUtils');

    CharacterServiceCRUD.createCharacter.mockResolvedValue({
      success: true,
      data: { _id: validCharacterId, ...mockCharacterData },
    });
    CharacterServiceCRUD.updateCharacter.mockResolvedValue({
      success: true,
      data: { _id: validCharacterId, ...mockCharacterData },
    });
    CharacterServiceCRUD.deleteCharacter.mockResolvedValue({
      success: true,
      data: undefined,
    });

    CharacterAccessUtils.checkOwnership.mockResolvedValue({
      success: true,
      data: { _id: validCharacterId, ...mockCharacterData },
    });
    CharacterAccessUtils.checkMultipleOwnership.mockResolvedValue({
      success: true,
      data: { owned: [validCharacterId], denied: [] },
    });

    CharacterValidationUtils.validateCharacterData.mockReturnValue({
      success: true,
      data: mockCharacterData,
    });
    CharacterValidationUtils.validateObjectId.mockReturnValue({ success: true });
  });

  describe('createCharacterTemplate', () => {
    it('should create character template successfully', async () => {
      const result = await CharacterServiceTemplates.createCharacterTemplate(
        validCharacterId,
        validUserId,
        'Test Template'
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('name');
    });

    it('should handle ownership check failures', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkOwnership.mockResolvedValue({
        success: false,
        error: { code: 'NOT_OWNER', message: 'Not owner' },
      });

      const result = await CharacterServiceTemplates.createCharacterTemplate(
        validCharacterId,
        validUserId,
        'Test Template'
      );
      expect(result.success).toBe(false);
    });
  });

  describe('cloneCharacter', () => {
    it('should clone character successfully', async () => {
      const result = await CharacterServiceTemplates.cloneCharacter(
        validCharacterId,
        validUserId,
        'Cloned Character'
      );
      expect(result.success).toBe(true);
    });

    it('should handle ownership check failures', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkOwnership.mockResolvedValue({
        success: false,
        error: { code: 'NOT_OWNER', message: 'Not owner' },
      });

      const result = await CharacterServiceTemplates.cloneCharacter(
        validCharacterId,
        validUserId,
        'Cloned Character'
      );
      expect(result.success).toBe(false);
    });
  });

  describe('createCharacterFromTemplate', () => {
    it('should create character from template successfully', async () => {
      const templateData = { name: 'Template', type: 'pc' as const };
      const result = await CharacterServiceTemplates.createCharacterFromTemplate(
        templateData,
        validUserId
      );
      expect(result.success).toBe(true);
    });

    it('should handle validation failures', async () => {
      const { CharacterValidationUtils } = require('../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateCharacterData.mockReturnValue({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Invalid data' },
      });

      const templateData = { name: 'Template', type: 'pc' as const };
      const result = await CharacterServiceTemplates.createCharacterFromTemplate(
        templateData,
        validUserId
      );
      expect(result.success).toBe(false);
    });
  });

  describe('createMultipleCharacters', () => {
    it('should create multiple characters successfully', async () => {
      const charactersData = [mockCharacterData, mockCharacterData];
      const result = await CharacterServiceTemplates.createMultipleCharacters(
        validUserId,
        charactersData
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('successful');
      expect(result.data).toHaveProperty('failed');
    });

    it('should handle empty array', async () => {
      const result = await CharacterServiceTemplates.createMultipleCharacters(validUserId, []);
      expect(result.success).toBe(true);
      expect(result.data.successful).toHaveLength(0);
    });
  });

  describe('updateMultipleCharacters', () => {
    it('should update multiple characters successfully', async () => {
      const updates = [
        { characterId: validCharacterId, data: { name: 'Updated 1' } },
        { characterId: validCharacterId, data: { name: 'Updated 2' } },
      ];
      const result = await CharacterServiceTemplates.updateMultipleCharacters(validUserId, updates);
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it('should handle empty array', async () => {
      const result = await CharacterServiceTemplates.updateMultipleCharacters(validUserId, []);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('deleteMultipleCharacters', () => {
    it('should delete multiple characters successfully', async () => {
      const characterIds = [validCharacterId];
      const result = await CharacterServiceTemplates.deleteMultipleCharacters(
        validUserId,
        characterIds
      );
      expect(result.success).toBe(true);
    });

    it('should handle ownership check failures', async () => {
      const { CharacterAccessUtils } = require('../utils/CharacterAccessUtils');
      CharacterAccessUtils.checkMultipleOwnership.mockResolvedValue({
        success: true,
        data: { owned: [], denied: [validCharacterId] },
      });

      const result = await CharacterServiceTemplates.deleteMultipleCharacters(
        validUserId,
        [validCharacterId]
      );
      expect(result.success).toBe(false);
    });

    it('should handle empty array', async () => {
      const result = await CharacterServiceTemplates.deleteMultipleCharacters(validUserId, []);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NO_CHARACTERS_PROVIDED');
    });
  });
});