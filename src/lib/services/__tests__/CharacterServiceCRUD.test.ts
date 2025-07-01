/**
 * Character Service CRUD Tests
 * Comprehensive tests for CharacterServiceCRUD module
 */

import { Types } from 'mongoose';
import { CharacterServiceCRUD } from '../CharacterServiceCRUD';
import { Character } from '../../models/Character';
import { CharacterServiceErrors, CHARACTER_ERROR_CODES } from '../CharacterServiceErrors';
import type { CharacterCreation, CharacterUpdate } from '../../validations/character';
import { createMockCharacter, createMockCharacterData } from './CharacterService.test-helpers';

// Mock the Character model
jest.mock('../../models/Character', () => ({
  Character: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    constructor: jest.fn(),
    save: jest.fn(),
  },
}));

// Mock mongoose Types
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
      constructor: jest.fn(),
    },
  },
}));

describe('CharacterServiceCRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Types.ObjectId.isValid as jest.Mock).mockImplementation((id: string) => {
      return id && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
    });
  });

  describe('createCharacter', () => {
    const validOwnerId = '507f1f77bcf86cd799439011';
    const mockCharacterData = createMockCharacterData();

    it('should create character successfully with valid data', async () => {
      const mockCharacter = createMockCharacter();
      (Character.countDocuments as jest.Mock).mockResolvedValue(5);
      
      // Mock the character constructor and save
      const mockSave = jest.fn().mockResolvedValue(mockCharacter);
      const mockCharacterConstructor = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));
      (Character as any) = mockCharacterConstructor;

      const result = await CharacterServiceCRUD.createCharacter(validOwnerId, mockCharacterData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacter);
      expect(Character.countDocuments).toHaveBeenCalledWith({
        ownerId: expect.any(Object),
      });
    });

    it('should fail with invalid owner ID', async () => {
      const result = await CharacterServiceCRUD.createCharacter('invalid', mockCharacterData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should fail when character limit exceeded', async () => {
      (Character.countDocuments as jest.Mock).mockResolvedValue(10);

      const result = await CharacterServiceCRUD.createCharacter(validOwnerId, mockCharacterData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED);
    });

    it('should handle database errors during creation', async () => {
      (Character.countDocuments as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await CharacterServiceCRUD.createCharacter(validOwnerId, mockCharacterData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });

    it('should validate character data before creation', async () => {
      const invalidData = { ...mockCharacterData, name: '' }; // Invalid name

      const result = await CharacterServiceCRUD.createCharacter(validOwnerId, invalidData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });
  });

  describe('getCharacterById', () => {
    const validCharacterId = '507f1f77bcf86cd799439011';
    const validUserId = '507f1f77bcf86cd799439012';

    it('should get character successfully with valid access', async () => {
      const mockCharacter = createMockCharacter();
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacter);
      expect(Character.findById).toHaveBeenCalledWith(validCharacterId);
    });

    it('should fail with invalid character ID', async () => {
      const result = await CharacterServiceCRUD.getCharacterById('invalid', validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
    });

    it('should fail with invalid user ID', async () => {
      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, 'invalid');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should fail when character not found', async () => {
      (Character.findById as jest.Mock).mockResolvedValue(null);

      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
    });

    it('should fail when user lacks access to character', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => '507f1f77bcf86cd799439999' } as any;
      mockCharacter.isPublic = false;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
    });

    it('should allow access to public characters', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => '507f1f77bcf86cd799439999' } as any;
      mockCharacter.isPublic = true;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterServiceCRUD.getCharacterById(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacter);
    });
  });

  describe('updateCharacter', () => {
    const validCharacterId = '507f1f77bcf86cd799439011';
    const validUserId = '507f1f77bcf86cd799439012';
    const updateData: CharacterUpdate = { name: 'Updated Name' };

    it('should update character successfully', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => validUserId } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);
      (Character.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        name: 'Updated Name',
      });

      const result = await CharacterServiceCRUD.updateCharacter(validCharacterId, validUserId, updateData);

      expect(result.success).toBe(true);
      expect(Character.findByIdAndUpdate).toHaveBeenCalledWith(
        validCharacterId,
        expect.objectContaining({ name: 'Updated Name' }),
        { new: true, runValidators: true }
      );
    });

    it('should fail with invalid character ID', async () => {
      const result = await CharacterServiceCRUD.updateCharacter('invalid', validUserId, updateData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
    });

    it('should fail with invalid update data', async () => {
      const invalidUpdate = { name: '' }; // Invalid name

      const result = await CharacterServiceCRUD.updateCharacter(validCharacterId, validUserId, invalidUpdate);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA);
    });

    it('should fail when user does not own character', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => '507f1f77bcf86cd799439999' } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterServiceCRUD.updateCharacter(validCharacterId, validUserId, updateData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
    });

    it('should fail when character not found during update', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => validUserId } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);
      (Character.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await CharacterServiceCRUD.updateCharacter(validCharacterId, validUserId, updateData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
    });
  });

  describe('deleteCharacter', () => {
    const validCharacterId = '507f1f77bcf86cd799439011';
    const validUserId = '507f1f77bcf86cd799439012';

    it('should delete character successfully', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => validUserId } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);
      (Character.findByIdAndDelete as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterServiceCRUD.deleteCharacter(validCharacterId, validUserId);

      expect(result.success).toBe(true);
      expect(Character.findByIdAndDelete).toHaveBeenCalledWith(validCharacterId);
    });

    it('should fail with invalid character ID', async () => {
      const result = await CharacterServiceCRUD.deleteCharacter('invalid', validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID);
    });

    it('should fail when user does not own character', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => '507f1f77bcf86cd799439999' } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);

      const result = await CharacterServiceCRUD.deleteCharacter(validCharacterId, validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS);
    });

    it('should fail when character not found during deletion', async () => {
      const mockCharacter = createMockCharacter();
      mockCharacter.ownerId = { toString: () => validUserId } as any;
      (Character.findById as jest.Mock).mockResolvedValue(mockCharacter);
      (Character.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await CharacterServiceCRUD.deleteCharacter(validCharacterId, validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND);
    });
  });
});