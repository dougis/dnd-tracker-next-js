import { describe, it, expect, beforeEach } from '@jest/globals';
import { GET, POST } from '../route';
import { CharacterService } from '@/lib/services/CharacterService';
import { CharacterType } from '@/lib/validations/character';
import {
  TEST_USER_ID,
  createMockRequest,
  createTestCharacter,
  createCharacterData,
  expectSuccessResponse,
  expectErrorResponse,
} from './test-helpers';

// Mock dependencies
jest.mock('@/lib/services/CharacterService');
jest.mock('@/lib/db');

const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

describe('/api/characters API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters', () => {
    it('should return characters for authenticated user', async () => {
      // Arrange
      const characters = [
        createTestCharacter({ name: 'Test Character 1' }),
        createTestCharacter({ name: 'Test Character 2', type: 'npc' }),
      ];

      mockCharacterService.searchCharacters.mockResolvedValue({
        characters,
        total: 2,
      });

      const request = createMockRequest('http://localhost:3000/api/characters', {
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data.map((c: any) => c.name)).toEqual(
        expect.arrayContaining(['Test Character 1', 'Test Character 2'])
      );
      expect(mockCharacterService.searchCharacters).toHaveBeenCalledWith(
        TEST_USER_ID,
        {},
        { limit: 50, offset: 0 }
      );
    });

    it('should return empty array for user with no characters', async () => {
      // Arrange
      mockCharacterService.searchCharacters.mockResolvedValue({
        characters: [],
        total: 0,
      });

      const request = createMockRequest('http://localhost:3000/api/characters', {
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const request = createMockRequest('http://localhost:3000/api/characters');

      // Act
      const response = await GET(request);

      // Assert
      await expectErrorResponse(response, 401, 'Unauthorized');
    });

    it('should filter characters by type when specified', async () => {
      // Arrange
      const pcCharacters = [
        createTestCharacter({ name: 'PC Character', type: 'pc' }),
      ];

      mockCharacterService.searchCharacters.mockResolvedValue({
        characters: pcCharacters,
        total: 1,
      });

      const request = createMockRequest('http://localhost:3000/api/characters?type=pc', {
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('PC Character');
      expect(data.data[0].type).toBe('pc');
      expect(mockCharacterService.searchCharacters).toHaveBeenCalledWith(
        TEST_USER_ID,
        { type: 'pc' },
        { limit: 50, offset: 0 }
      );
    });
  });

  describe('POST /api/characters', () => {
    it('should create a new character', async () => {
      // Arrange
      const characterData = createCharacterData();
      const createdCharacter = createTestCharacter(characterData);

      mockCharacterService.createCharacter.mockResolvedValue(createdCharacter);

      const request = createMockRequest('http://localhost:3000/api/characters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: characterData
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(characterData.name);
      expect(data.data.race).toBe(characterData.race);
      expect(mockCharacterService.createCharacter).toHaveBeenCalledWith(
        TEST_USER_ID,
        expect.objectContaining({
          ...characterData,
          // Schema adds these defaults
          equipment: [],
          size: 'medium',
          skills: {},
          spells: [],
        })
      );
    });

    it('should return 400 for invalid character data', async () => {
      // Arrange
      const invalidCharacterData = {
        name: '', // Invalid: empty name
        type: 'INVALID_TYPE' // Invalid: not a valid CharacterType
      };

      const request = createMockRequest('http://localhost:3000/api/characters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: invalidCharacterData
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const characterData = createCharacterData();

      const request = createMockRequest('http://localhost:3000/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: characterData
      });

      // Act
      const response = await POST(request);

      // Assert
      await expectErrorResponse(response, 401, 'Unauthorized');
    });
  });
});