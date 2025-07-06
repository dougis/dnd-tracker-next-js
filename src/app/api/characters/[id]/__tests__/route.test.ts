import { describe, it, expect, beforeEach } from '@jest/globals';
import { GET, PUT, DELETE } from '../route';
import { CharacterService } from '@/lib/services/CharacterService';
import { CharacterType } from '@/lib/validations/character';
import {
  TEST_USER_ID,
  TEST_CHARACTER_ID,
  createMockParams,
  createMockRequest,
  createTestCharacter,
  expectSuccessResponse,
  expectErrorResponse,
} from '../../__tests__/test-helpers';

// Mock dependencies
jest.mock('@/lib/services/CharacterService');
jest.mock('@/lib/db');

const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

describe('/api/characters/[id] API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters/[id]', () => {
    it('should return character when user owns it', async () => {
      // Arrange
      const character = createTestCharacter();
      mockCharacterService.getCharacterById.mockResolvedValue(character);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await GET(request, { params: createMockParams() });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Test Character');
      expect(data.data._id).toBe(TEST_CHARACTER_ID);
      expect(mockCharacterService.getCharacterById).toHaveBeenCalledWith(
        TEST_USER_ID,
        TEST_CHARACTER_ID
      );
    });

    it('should return 404 when character does not exist', async () => {
      // Arrange
      mockCharacterService.getCharacterById.mockResolvedValue(null);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await GET(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 404, 'Character not found');
    });

    it('should return 403 when user does not own character', async () => {
      // Arrange
      const error = new Error('access denied');
      mockCharacterService.getCharacterById.mockRejectedValue(error);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        headers: { 'x-user-id': 'other-user-id' }
      });

      // Act
      const response = await GET(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 403, 'Access denied');
    });

    it('should return public character when not owned but public', async () => {
      // Arrange
      const publicCharacter = createTestCharacter({
        name: 'Public Character',
        isPublic: true
      });
      mockCharacterService.getCharacterById.mockResolvedValue(publicCharacter);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        headers: { 'x-user-id': 'other-user-id' }
      });

      // Act
      const response = await GET(request, { params: createMockParams() });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Public Character');
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`);

      // Act
      const response = await GET(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('PUT /api/characters/[id]', () => {
    it('should update character when user owns it', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        hitPoints: { maximum: 19, current: 19, temporary: 0 }
      };

      const updatedCharacter = createTestCharacter(updateData);
      mockCharacterService.updateCharacter.mockResolvedValue(updatedCharacter);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: updateData
      });

      // Act
      const response = await PUT(request, { params: createMockParams() });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Name');
      // expect(data.data.level).toBe(2); // Level is calculated from classes, not directly settable
      expect(data.data.hitPoints.maximum).toBe(19);
      expect(mockCharacterService.updateCharacter).toHaveBeenCalledWith(
        TEST_USER_ID,
        TEST_CHARACTER_ID,
        updateData
      );
    });

    it('should return 404 when character does not exist', async () => {
      // Arrange
      mockCharacterService.updateCharacter.mockResolvedValue(null);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: { name: 'Updated Name' }
      });

      // Act
      const response = await PUT(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 404, 'Character not found');
    });

    it('should return 403 when user does not own character', async () => {
      // Arrange
      const error = new Error('access denied');
      mockCharacterService.updateCharacter.mockRejectedValue(error);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'other-user-id'
        },
        body: { name: 'Updated Name' }
      });

      // Act
      const response = await PUT(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 403, 'Access denied');
    });
  });

  describe('DELETE /api/characters/[id]', () => {
    it('should delete character when user owns it', async () => {
      // Arrange
      mockCharacterService.deleteCharacter.mockResolvedValue(true);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await DELETE(request, { params: createMockParams() });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Character deleted successfully');
      expect(mockCharacterService.deleteCharacter).toHaveBeenCalledWith(
        TEST_USER_ID,
        TEST_CHARACTER_ID
      );
    });

    it('should return 404 when character does not exist', async () => {
      // Arrange
      mockCharacterService.deleteCharacter.mockResolvedValue(false);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER_ID }
      });

      // Act
      const response = await DELETE(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 404, 'Character not found');
    });

    it('should return 403 when user does not own character', async () => {
      // Arrange
      const error = new Error('access denied');
      mockCharacterService.deleteCharacter.mockRejectedValue(error);

      const request = createMockRequest(`http://localhost:3000/api/characters/${TEST_CHARACTER_ID}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'other-user-id' }
      });

      // Act
      const response = await DELETE(request, { params: createMockParams() });

      // Assert
      await expectErrorResponse(response, 403, 'Access denied');
    });
  });
});