import { describe, it, expect, beforeEach } from '@jest/globals';
import { GET, PUT, DELETE } from '../route';
import { CharacterService } from '@/lib/services/CharacterService';
import {
  TEST_USER_ID,
  TEST_CHARACTER_ID,
  createMockParams,
  createTestCharacter,
  expectErrorResponse,
} from '../../__tests__/test-helpers';
import {
  mockCharacterService,
  setupSuccessfulCharacterById,
  setupSuccessfulCharacterUpdate,
  setupSuccessfulCharacterDelete,
  setupCharacterNotFound,
  setupAccessDeniedError,
  createCharacterRequest,
  createUnauthenticatedRequest,
  createUpdateData,
  expectSuccessfulResponse,
  runAuthenticationTest,
  runNotFoundTest,
  runAccessDeniedTest,
} from '../../__tests__/shared-test-utils';

// Mock dependencies
jest.mock('@/lib/services/CharacterService');
jest.mock('@/lib/db');

describe('/api/characters/[id] API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters/[id]', () => {
    it('should return character when user owns it', async () => {
      // Arrange
      const character = createTestCharacter();
      setupSuccessfulCharacterById(character);
      const request = createCharacterRequest();

      // Act
      const response = await GET(request, { params: createMockParams() });
      const data = await expectSuccessfulResponse(response);

      // Assert
      expect(data.data.name).toBe('Test Character');
      expect(data.data._id).toBe(TEST_CHARACTER_ID);
      expect(mockCharacterService.getCharacterById).toHaveBeenCalledWith(
        TEST_CHARACTER_ID,
        TEST_USER_ID
      );
    });

    it('should return 404 when character does not exist', async () => {
      await runNotFoundTest(GET, setupCharacterNotFound, { params: createMockParams() });
    });

    it('should return 403 when user does not own character', async () => {
      await runAccessDeniedTest(GET, setupAccessDeniedError, { params: createMockParams() });
    });

    it('should return public character when not owned but public', async () => {
      // Arrange
      const publicCharacter = createTestCharacter({ name: 'Public Character', isPublic: true });
      setupSuccessfulCharacterById(publicCharacter);
      const request = createCharacterRequest({ headers: { 'x-user-id': 'other-user-id' } });

      // Act
      const response = await GET(request, { params: createMockParams() });
      const data = await expectSuccessfulResponse(response);

      // Assert
      expect(data.data.name).toBe('Public Character');
    });

    it('should return 401 when user is not authenticated', async () => {
      await runAuthenticationTest(GET, { params: createMockParams() });
    });
  });

  describe('PUT /api/characters/[id]', () => {
    it('should update character when user owns it', async () => {
      // Arrange
      const updateData = createUpdateData();
      const updatedCharacter = createTestCharacter(updateData);
      setupSuccessfulCharacterUpdate(updatedCharacter);
      const request = createCharacterRequest({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: updateData
      });

      // Act
      const response = await PUT(request, { params: createMockParams() });
      const data = await expectSuccessfulResponse(response);

      // Assert
      expect(data.data.name).toBe('Updated Name');
      expect(data.data.hitPoints.maximum).toBe(19);
      expect(mockCharacterService.updateCharacter).toHaveBeenCalledWith(
        TEST_CHARACTER_ID,
        TEST_USER_ID,
        updateData
      );
    });

    it('should return 404 when character does not exist', async () => {
      await runNotFoundTest(PUT, setupCharacterNotFound, { params: createMockParams() });
    });

    it('should return 403 when user does not own character', async () => {
      await runAccessDeniedTest(PUT, setupAccessDeniedError, { params: createMockParams() });
    });
  });

  describe('DELETE /api/characters/[id]', () => {
    it('should delete character when user owns it', async () => {
      // Arrange
      setupSuccessfulCharacterDelete();
      const request = createCharacterRequest({ method: 'DELETE' });

      // Act
      const response = await DELETE(request, { params: createMockParams() });
      const data = await expectSuccessfulResponse(response);

      // Assert
      expect(data.message).toBe('Character deleted successfully');
      expect(mockCharacterService.deleteCharacter).toHaveBeenCalledWith(
        TEST_CHARACTER_ID,
        TEST_USER_ID
      );
    });

    it('should return 404 when character does not exist', async () => {
      await runNotFoundTest(DELETE, setupCharacterNotFound, { params: createMockParams() });
    });

    it('should return 403 when user does not own character', async () => {
      await runAccessDeniedTest(DELETE, setupAccessDeniedError, { params: createMockParams() });
    });
  });
});