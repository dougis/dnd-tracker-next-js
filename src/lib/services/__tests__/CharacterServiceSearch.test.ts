/**
 * Character Service Search Tests
 * Comprehensive tests for CharacterServiceSearch module
 */

import { Types } from 'mongoose';
import { CharacterServiceSearch } from '../CharacterServiceSearch';
import { Character } from '../../models/Character';
import { CHARACTER_ERROR_CODES } from '../CharacterServiceErrors';
import { createMockCharacter } from './CharacterService.test-helpers';

// Mock the Character model
jest.mock('../../models/Character', () => ({
  Character: {
    find: jest.fn(),
    countDocuments: jest.fn(),
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

describe('CharacterServiceSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Types.ObjectId.isValid as jest.Mock).mockImplementation((id: string) => {
      return id && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
    });
  });

  describe('getCharactersByOwner', () => {
    const validOwnerId = '507f1f77bcf86cd799439011';

    it('should get characters by owner with pagination', async () => {
      const mockCharacters = [createMockCharacter(), createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);
      (Character.countDocuments as jest.Mock).mockResolvedValue(25);

      const result = await CharacterServiceSearch.getCharactersByOwner(validOwnerId, 2, 10);

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(mockCharacters);
      expect(result.data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
      expect(mockFind.skip).toHaveBeenCalledWith(10);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
    });

    it('should use default pagination values', async () => {
      const mockCharacters = [createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);
      (Character.countDocuments as jest.Mock).mockResolvedValue(5);

      const result = await CharacterServiceSearch.getCharactersByOwner(validOwnerId);

      expect(result.success).toBe(true);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(20);
      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(20);
    });

    it('should fail with invalid owner ID', async () => {
      const result = await CharacterServiceSearch.getCharactersByOwner('invalid');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should handle database errors', async () => {
      (Character.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await CharacterServiceSearch.getCharactersByOwner(validOwnerId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('searchCharacters', () => {
    const validUserId = '507f1f77bcf86cd799439012';

    it('should search characters by name', async () => {
      const mockCharacters = [createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);

      const result = await CharacterServiceSearch.searchCharacters('Gandalf', validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
      expect(Character.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [
              { ownerId: expect.any(Object) },
              { isPublic: true },
            ],
          },
          {
            $text: { $search: 'Gandalf' },
          },
        ],
      });
      expect(mockFind.sort).toHaveBeenCalledWith({ score: { $meta: 'textScore' } });
    });

    it('should fail with empty search term', async () => {
      const result = await CharacterServiceSearch.searchCharacters('', validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
    });

    it('should fail with whitespace-only search term', async () => {
      const result = await CharacterServiceSearch.searchCharacters('   ', validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
    });

    it('should fail with invalid user ID', async () => {
      const result = await CharacterServiceSearch.searchCharacters('Gandalf', 'invalid');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should handle database errors during search', async () => {
      (Character.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await CharacterServiceSearch.searchCharacters('Gandalf', validUserId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('getCharactersByClass', () => {
    const validUserId = '507f1f77bcf86cd799439012';

    it('should get characters by class', async () => {
      const mockCharacters = [createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);

      const result = await CharacterServiceSearch.getCharactersByClass('wizard', validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
      expect(Character.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [
              { ownerId: expect.any(Object) },
              { isPublic: true },
            ],
          },
          {
            'classes.class': 'wizard',
          },
        ],
      });
      expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should fail with invalid user ID', async () => {
      const result = await CharacterServiceSearch.getCharactersByClass('wizard', 'invalid');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });
  });

  describe('getCharactersByRace', () => {
    const validUserId = '507f1f77bcf86cd799439012';

    it('should get characters by race', async () => {
      const mockCharacters = [createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);

      const result = await CharacterServiceSearch.getCharactersByRace('elf', validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
      expect(Character.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [
              { ownerId: expect.any(Object) },
              { isPublic: true },
            ],
          },
          { race: 'elf' },
        ],
      });
      expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should fail with invalid user ID', async () => {
      const result = await CharacterServiceSearch.getCharactersByRace('elf', 'invalid');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });
  });

  describe('getCharactersByType', () => {
    const validUserId = '507f1f77bcf86cd799439012';

    it('should get characters by type', async () => {
      const mockCharacters = [createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);

      const result = await CharacterServiceSearch.getCharactersByType('pc', validUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
      expect(Character.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [
              { ownerId: expect.any(Object) },
              { isPublic: true },
            ],
          },
          { type: 'pc' },
        ],
      });
      expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should fail with invalid user ID', async () => {
      const result = await CharacterServiceSearch.getCharactersByType('pc', 'invalid');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });
  });

  describe('getPublicCharacters', () => {
    it('should get public characters', async () => {
      const mockCharacters = [createMockCharacter()];
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockCharacters),
      };
      (Character.find as jest.Mock).mockReturnValue(mockFind);

      const result = await CharacterServiceSearch.getPublicCharacters();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
      expect(Character.find).toHaveBeenCalledWith({ isPublic: true });
      expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should handle database errors', async () => {
      (Character.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await CharacterServiceSearch.getPublicCharacters();

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });
});