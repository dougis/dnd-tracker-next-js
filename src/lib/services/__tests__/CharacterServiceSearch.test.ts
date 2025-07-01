/**
 * Character Service Search Tests
 *
 * Basic tests for search operations to improve coverage
 */

jest.mock('../utils/CharacterQueryUtils', () => ({
  CharacterQueryUtils: {
    findByOwner: jest.fn(),
    searchCharacters: jest.fn(),
    findByClass: jest.fn(),
    findByRace: jest.fn(),
    findByType: jest.fn(),
    findPublicCharacters: jest.fn(),
  },
}));

import { CharacterServiceSearch } from '../CharacterServiceSearch';

describe('CharacterServiceSearch', () => {
  const validUserId = '507f1f77bcf86cd799439012';
  const mockResults = [{ _id: '123', name: 'Test Character' }];
  const mockPaginatedResults = {
    items: mockResults,
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const { CharacterQueryUtils } = require('../utils/CharacterQueryUtils');
    CharacterQueryUtils.findByOwner.mockResolvedValue({
      success: true,
      data: mockPaginatedResults,
    });
    CharacterQueryUtils.searchCharacters.mockResolvedValue({
      success: true,
      data: mockResults,
    });
    CharacterQueryUtils.findByClass.mockResolvedValue({
      success: true,
      data: mockResults,
    });
    CharacterQueryUtils.findByRace.mockResolvedValue({
      success: true,
      data: mockResults,
    });
    CharacterQueryUtils.findByType.mockResolvedValue({
      success: true,
      data: mockResults,
    });
    CharacterQueryUtils.findPublicCharacters.mockResolvedValue({
      success: true,
      data: mockResults,
    });
  });

  describe('getCharactersByOwner', () => {
    it('should get characters by owner successfully', async () => {
      const result = await CharacterServiceSearch.getCharactersByOwner(validUserId, 1, 20);
      expect(result.success).toBe(true);
      expect(result.data.items).toEqual(mockResults);
    });

    it('should handle query failures', async () => {
      const { CharacterQueryUtils } = require('../utils/CharacterQueryUtils');
      CharacterQueryUtils.findByOwner.mockResolvedValue({
        success: false,
        error: { code: 'QUERY_ERROR', message: 'Query failed' },
      });

      const result = await CharacterServiceSearch.getCharactersByOwner(validUserId);
      expect(result.success).toBe(false);
    });
  });

  describe('searchCharacters', () => {
    it('should search characters successfully', async () => {
      const result = await CharacterServiceSearch.searchCharacters('gandalf', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });

    it('should handle query failures', async () => {
      const { CharacterQueryUtils } = require('../utils/CharacterQueryUtils');
      CharacterQueryUtils.searchCharacters.mockResolvedValue({
        success: false,
        error: { code: 'SEARCH_ERROR', message: 'Search failed' },
      });

      const result = await CharacterServiceSearch.searchCharacters('gandalf', validUserId);
      expect(result.success).toBe(false);
    });
  });

  describe('getCharactersByClass', () => {
    it('should get characters by class successfully', async () => {
      const result = await CharacterServiceSearch.getCharactersByClass('wizard', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });

    it('should handle query failures', async () => {
      const { CharacterQueryUtils } = require('../utils/CharacterQueryUtils');
      CharacterQueryUtils.findByClass.mockResolvedValue({
        success: false,
        error: { code: 'QUERY_ERROR', message: 'Query failed' },
      });

      const result = await CharacterServiceSearch.getCharactersByClass('wizard', validUserId);
      expect(result.success).toBe(false);
    });
  });

  describe('getCharactersByRace', () => {
    it('should get characters by race successfully', async () => {
      const result = await CharacterServiceSearch.getCharactersByRace('elf', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });
  });

  describe('getCharactersByType', () => {
    it('should get characters by type successfully', async () => {
      const result = await CharacterServiceSearch.getCharactersByType('pc', validUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });
  });

  describe('getPublicCharacters', () => {
    it('should get public characters successfully', async () => {
      const result = await CharacterServiceSearch.getPublicCharacters();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });
  });
});