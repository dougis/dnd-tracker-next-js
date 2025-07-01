/**
 * Character Query Utils Tests
 */

import { CharacterQueryUtils } from '../../utils/CharacterQueryUtils';
import { CHARACTER_ERROR_CODES } from '../../CharacterServiceErrors';

// Mock the Character model
jest.mock('../../../models/Character', () => ({
  Character: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// Mock other utils
jest.mock('../../utils/CharacterValidationUtils', () => ({
  CharacterValidationUtils: {
    validatePagination: jest.fn(),
    validateObjectId: jest.fn(),
    validateSearchCriteria: jest.fn(),
  },
}));

jest.mock('../../utils/CharacterAccessUtils', () => ({
  CharacterAccessUtils: {
    prepareUserAccessQuery: jest.fn(),
    createOwnershipFilter: jest.fn(),
  },
}));

describe('CharacterQueryUtils', () => {
  const validUserId = '507f1f77bcf86cd799439012';
  const mockCharacters = [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Character',
      type: 'pc',
      race: 'human',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mocks
    const { CharacterValidationUtils } = require('../../utils/CharacterValidationUtils');
    const { CharacterAccessUtils } = require('../../utils/CharacterAccessUtils');

    CharacterValidationUtils.validatePagination.mockReturnValue({
      success: true,
      data: { page: 1, limit: 20, skip: 0 },
    });
    CharacterValidationUtils.validateObjectId.mockReturnValue({ success: true });
    CharacterValidationUtils.validateSearchCriteria.mockReturnValue({
      success: true,
      data: 'test',
    });

    CharacterAccessUtils.prepareUserAccessQuery.mockResolvedValue({
      success: true,
      data: { $or: [{ ownerId: validUserId }, { isPublic: true }] },
    });
    CharacterAccessUtils.createOwnershipFilter.mockReturnValue({ ownerId: validUserId });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockResolvedValue(25);
      
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(mockCharacters);
      expect(result.data.pagination.total).toBe(25);
      expect(result.data.pagination.totalPages).toBe(2);
    });

    it('should handle pagination validation errors', async () => {
      const { CharacterValidationUtils } = require('../../utils/CharacterValidationUtils');
      CharacterValidationUtils.validatePagination.mockReturnValue({
        success: false,
        error: { code: 'INVALID_PAGINATION', message: 'Invalid pagination' },
      });

      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expect(result.success).toBe(false);
    });

    it('should handle user access query errors', async () => {
      const { CharacterAccessUtils } = require('../../utils/CharacterAccessUtils');
      CharacterAccessUtils.prepareUserAccessQuery.mockResolvedValue({
        success: false,
        error: { code: 'INVALID_USER', message: 'Invalid user' },
      });

      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expect(result.success).toBe(false);
    });

    it('should apply field selection', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockResolvedValue(1);
      
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const options = { includeFields: ['name', 'type'] };
      await CharacterQueryUtils.findWithPagination({}, validUserId, options);
      expect(mockQuery.select).toHaveBeenCalledWith('name type');
    });

    it('should apply field exclusion', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockResolvedValue(1);
      
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const options = { excludeFields: ['description', 'history'] };
      await CharacterQueryUtils.findWithPagination({}, validUserId, options);
      expect(mockQuery.select).toHaveBeenCalledWith('-description -history');
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockRejectedValue(new Error('Database error'));

      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('findWithUserAccess', () => {
    it('should return characters with user access control', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findWithUserAccess({}, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });

    it('should handle user access query errors', async () => {
      const { CharacterAccessUtils } = require('../../utils/CharacterAccessUtils');
      CharacterAccessUtils.prepareUserAccessQuery.mockResolvedValue({
        success: false,
        error: { code: 'INVALID_USER', message: 'Invalid user' },
      });

      const result = await CharacterQueryUtils.findWithUserAccess({}, validUserId);
      expect(result.success).toBe(false);
    });
  });

  describe('findByOwner', () => {
    it('should find characters by owner with pagination', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockResolvedValue(5);
      
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findByOwner(validUserId, 1, 10);
      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(mockCharacters);
    });

    it('should handle invalid owner ID', async () => {
      const { CharacterValidationUtils } = require('../../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateObjectId.mockReturnValue({
        success: false,
        error: { code: CHARACTER_ERROR_CODES.INVALID_OWNER_ID, message: 'Invalid owner ID' },
      });

      const result = await CharacterQueryUtils.findByOwner('invalid');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });
  });

  describe('searchCharacters', () => {
    it('should search characters with text search', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.searchCharacters('gandalf', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });

    it('should handle invalid search criteria', async () => {
      const { CharacterValidationUtils } = require('../../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateSearchCriteria.mockReturnValue({
        success: false,
        error: { code: CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA, message: 'Invalid search' },
      });

      const result = await CharacterQueryUtils.searchCharacters('', validUserId);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
    });
  });

  describe('findByClass', () => {
    it('should find characters by class', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findByClass('wizard', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });
  });

  describe('findByRace', () => {
    it('should find characters by race', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findByRace('elf', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });
  });

  describe('findByType', () => {
    it('should find characters by type', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findByType('pc', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });
  });

  describe('findPublicCharacters', () => {
    it('should find public characters', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const result = await CharacterQueryUtils.findPublicCharacters();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../../models/Character');
      Character.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await CharacterQueryUtils.findPublicCharacters();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('countByOwner', () => {
    it('should count characters by owner', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockResolvedValue(5);

      const result = await CharacterQueryUtils.countByOwner(validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toBe(5);
    });

    it('should handle invalid owner ID', async () => {
      const { CharacterValidationUtils } = require('../../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateObjectId.mockReturnValue({
        success: false,
        error: { code: CHARACTER_ERROR_CODES.INVALID_OWNER_ID, message: 'Invalid owner ID' },
      });

      const result = await CharacterQueryUtils.countByOwner('invalid');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../../models/Character');
      Character.countDocuments.mockRejectedValue(new Error('Database error'));

      const result = await CharacterQueryUtils.countByOwner(validUserId);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('findWithAdvancedFilter', () => {
    it('should find characters with advanced filters', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const filter = {
        classes: ['wizard', 'sorcerer'],
        races: ['elf', 'human'],
        types: ['pc'],
        levelRange: { min: 1, max: 10 },
      };

      const result = await CharacterQueryUtils.findWithAdvancedFilter(filter, validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacters);
    });

    it('should handle search in advanced filter', async () => {
      const { Character } = require('../../../models/Character');
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCharacters),
      };
      Character.find.mockReturnValue(mockQuery);

      const filter = {
        search: 'gandalf',
        classes: ['wizard'],
      };

      const result = await CharacterQueryUtils.findWithAdvancedFilter(filter, validUserId);
      expect(result.success).toBe(true);
    });

    it('should handle search validation errors', async () => {
      const { CharacterValidationUtils } = require('../../utils/CharacterValidationUtils');
      CharacterValidationUtils.validateSearchCriteria.mockReturnValue({
        success: false,
        error: { code: CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA, message: 'Invalid search' },
      });

      const filter = { search: 'invalid-search-term' };
      const result = await CharacterQueryUtils.findWithAdvancedFilter(filter, validUserId);
      expect(result.success).toBe(false);
    });

    it('should handle database errors', async () => {
      const { Character } = require('../../../models/Character');
      Character.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await CharacterQueryUtils.findWithAdvancedFilter({}, validUserId);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });
});