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

  // Helper function to get mocked dependencies
  const getMocks = () => ({
    Character: require('../../../models/Character').Character,
    CharacterValidationUtils: require('../../utils/CharacterValidationUtils').CharacterValidationUtils,
    CharacterAccessUtils: require('../../utils/CharacterAccessUtils').CharacterAccessUtils,
  });

  // Helper function to create a standard mock query
  const createMockQuery = (additionalMethods = {}) => ({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockCharacters),
    ...additionalMethods,
  });

  // Helper function to expect successful result
  const expectSuccessResult = (result: any, expectedData?: any) => {
    expect(result.success).toBe(true);
    if (expectedData !== undefined) {
      expect(result.data).toEqual(expectedData);
    }
  };

  // Helper function to expect failed result
  const expectFailedResult = (result: any, expectedCode?: string) => {
    expect(result.success).toBe(false);
    if (expectedCode) {
      expect(result.error.code).toBe(expectedCode);
    }
  };

  // Helper function to expect paginated result
  const expectPaginatedResult = (result: any, expectedTotal: number, expectedPages: number) => {
    expectSuccessResult(result);
    expect(result.data.items).toEqual(mockCharacters);
    expect(result.data.pagination.total).toBe(expectedTotal);
    expect(result.data.pagination.totalPages).toBe(expectedPages);
  };

  // Helper function to mock validation error
  const mockValidationError = (utilMethod: string, errorCode: string, errorMessage: string) => {
    const { CharacterValidationUtils } = getMocks();
    CharacterValidationUtils[utilMethod].mockReturnValue({
      success: false,
      error: { code: errorCode, message: errorMessage },
    });
  };

  // Helper function to mock access error
  const mockAccessError = (errorCode: string, errorMessage: string) => {
    const { CharacterAccessUtils } = getMocks();
    CharacterAccessUtils.prepareUserAccessQuery.mockResolvedValue({
      success: false,
      error: { code: errorCode, message: errorMessage },
    });
  };

  // Helper function to mock database error
  const mockDatabaseError = (method: 'find' | 'countDocuments' = 'countDocuments') => {
    const { Character } = getMocks();
    if (method === 'find') {
      Character.find.mockImplementation(() => {
        throw new Error('Database error');
      });
    } else {
      Character.countDocuments.mockRejectedValue(new Error('Database error'));
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mocks
    const { CharacterValidationUtils, CharacterAccessUtils } = getMocks();

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
      const { Character } = getMocks();
      Character.countDocuments.mockResolvedValue(25);
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expectPaginatedResult(result, 25, 2);
    });

    it('should handle pagination validation errors', async () => {
      mockValidationError('validatePagination', 'INVALID_PAGINATION', 'Invalid pagination');
      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expectFailedResult(result);
    });

    it('should handle user access query errors', async () => {
      mockAccessError('INVALID_USER', 'Invalid user');
      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expectFailedResult(result);
    });

    it('should apply field selection', async () => {
      const { Character } = getMocks();
      Character.countDocuments.mockResolvedValue(1);
      const mockQuery = createMockQuery({ select: jest.fn().mockReturnThis() });
      Character.find.mockReturnValue(mockQuery);

      const options = { includeFields: ['name', 'type'] };
      await CharacterQueryUtils.findWithPagination({}, validUserId, options);
      expect(mockQuery.select).toHaveBeenCalledWith('name type');
    });

    it('should apply field exclusion', async () => {
      const { Character } = getMocks();
      Character.countDocuments.mockResolvedValue(1);
      const mockQuery = createMockQuery({ select: jest.fn().mockReturnThis() });
      Character.find.mockReturnValue(mockQuery);

      const options = { excludeFields: ['description', 'history'] };
      await CharacterQueryUtils.findWithPagination({}, validUserId, options);
      expect(mockQuery.select).toHaveBeenCalledWith('-description -history');
    });

    it('should handle database errors', async () => {
      mockDatabaseError();
      const result = await CharacterQueryUtils.findWithPagination({}, validUserId);
      expectFailedResult(result, CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('findWithUserAccess', () => {
    it('should return characters with user access control', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findWithUserAccess({}, validUserId);
      expectSuccessResult(result, mockCharacters);
    });

    it('should handle user access query errors', async () => {
      mockAccessError('INVALID_USER', 'Invalid user');
      const result = await CharacterQueryUtils.findWithUserAccess({}, validUserId);
      expectFailedResult(result);
    });
  });

  describe('findByOwner', () => {
    it('should find characters by owner with pagination', async () => {
      const { Character } = getMocks();
      Character.countDocuments.mockResolvedValue(5);
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findByOwner(validUserId, 1, 10);
      expectSuccessResult(result);
      expect(result.data.items).toEqual(mockCharacters);
    });

    it('should handle invalid owner ID', async () => {
      mockValidationError('validateObjectId', CHARACTER_ERROR_CODES.INVALID_OWNER_ID, 'Invalid owner ID');
      const result = await CharacterQueryUtils.findByOwner('invalid');
      expectFailedResult(result, CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });
  });

  describe('searchCharacters', () => {
    it('should search characters with text search', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.searchCharacters('gandalf', validUserId);
      expectSuccessResult(result, mockCharacters);
    });

    it('should handle invalid search criteria', async () => {
      mockValidationError('validateSearchCriteria', CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA, 'Invalid search');
      const result = await CharacterQueryUtils.searchCharacters('', validUserId);
      expectFailedResult(result, CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA);
    });
  });

  describe('findByClass', () => {
    it('should find characters by class', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findByClass('wizard', validUserId);
      expectSuccessResult(result, mockCharacters);
    });
  });

  describe('findByRace', () => {
    it('should find characters by race', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findByRace('elf', validUserId);
      expectSuccessResult(result, mockCharacters);
    });
  });

  describe('findByType', () => {
    it('should find characters by type', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findByType('pc', validUserId);
      expectSuccessResult(result, mockCharacters);
    });
  });

  describe('findPublicCharacters', () => {
    it('should find public characters', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const result = await CharacterQueryUtils.findPublicCharacters();
      expectSuccessResult(result, mockCharacters);
    });

    it('should handle database errors', async () => {
      mockDatabaseError('find');
      const result = await CharacterQueryUtils.findPublicCharacters();
      expectFailedResult(result, CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('countByOwner', () => {
    it('should count characters by owner', async () => {
      const { Character } = getMocks();
      Character.countDocuments.mockResolvedValue(5);

      const result = await CharacterQueryUtils.countByOwner(validUserId);
      expectSuccessResult(result, 5);
    });

    it('should handle invalid owner ID', async () => {
      mockValidationError('validateObjectId', CHARACTER_ERROR_CODES.INVALID_OWNER_ID, 'Invalid owner ID');
      const result = await CharacterQueryUtils.countByOwner('invalid');
      expectFailedResult(result, CHARACTER_ERROR_CODES.INVALID_OWNER_ID);
    });

    it('should handle database errors', async () => {
      mockDatabaseError();
      const result = await CharacterQueryUtils.countByOwner(validUserId);
      expectFailedResult(result, CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });

  describe('findWithAdvancedFilter', () => {
    it('should find characters with advanced filters', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const filter = {
        classes: ['wizard', 'sorcerer'],
        races: ['elf', 'human'],
        types: ['pc'],
        levelRange: { min: 1, max: 10 },
      };

      const result = await CharacterQueryUtils.findWithAdvancedFilter(filter, validUserId);
      expectSuccessResult(result, mockCharacters);
    });

    it('should handle search in advanced filter', async () => {
      const { Character } = getMocks();
      Character.find.mockReturnValue(createMockQuery());

      const filter = {
        search: 'gandalf',
        classes: ['wizard'],
      };

      const result = await CharacterQueryUtils.findWithAdvancedFilter(filter, validUserId);
      expectSuccessResult(result);
    });

    it('should handle search validation errors', async () => {
      mockValidationError('validateSearchCriteria', CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA, 'Invalid search');
      const filter = { search: 'invalid-search-term' };
      const result = await CharacterQueryUtils.findWithAdvancedFilter(filter, validUserId);
      expectFailedResult(result);
    });

    it('should handle database errors', async () => {
      mockDatabaseError('find');
      const result = await CharacterQueryUtils.findWithAdvancedFilter({}, validUserId);
      expectFailedResult(result, CHARACTER_ERROR_CODES.DATABASE_ERROR);
    });
  });
});