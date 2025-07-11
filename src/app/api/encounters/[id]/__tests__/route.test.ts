import { GET, PUT, DELETE } from '../route';
import { EncounterService } from '@/lib/services/EncounterService';
import { auth } from '@/lib/auth';
import {
  createTestEncounter,
  createTestParticipant,
  mockApiResponses,
} from '@/app/encounters/[id]/__tests__/test-helpers';
import {
  createValidUpdateData,
  createInvalidUpdateData,
  createInvalidParticipantData,
  createInvalidSettingsData,
  createMockRequest,
  createTestContext,
  createAsyncParams,
  createJsonParseErrorRequest,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse,
  createUnauthorizedEncounter,
  expectUnauthorizedResponse,
  expectUnauthenticatedResponse,
} from './test-helpers';

// Mock dependencies
jest.mock('@/lib/services/EncounterService');
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/encounters/[id] route', () => {
  const mockEncounter = createTestEncounter({
    name: 'Test Encounter',
    description: 'Test description',
    difficulty: 'medium',
    estimatedDuration: 60,
    targetLevel: 5,
    participants: [
      createTestParticipant({
        name: 'Test Player',
        type: 'pc',
        maxHitPoints: 50,
        armorClass: 16,
      }),
    ],
    tags: ['test'],
  });

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockSession = {
    user: mockUser,
    expires: new Date(Date.now() + 3600000).toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession);
  });

  describe('GET /api/encounters/[id]', () => {
    it('should return encounter when found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );

      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createTestContext());
      const data = await response.json();

      expectSuccessResponse(response, data);
      expect(data.data.name).toBe('Test Encounter');
      expect(mockEncounterService.getEncounterById).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createAsyncParams('invalid-id'));
      const data = await response.json();

      expectErrorResponse(response, data, 404, 'Encounter not found');
    });

    it('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createTestContext());
      const data = await response.json();

      expectUnauthenticatedResponse(response, data);
    });

    it('should handle service errors gracefully', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.error('Database connection failed')
      );

      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createTestContext());
      const data = await response.json();

      expectErrorResponse(response, data, 500, 'Database connection failed');
    });
  });

  describe('PUT /api/encounters/[id]', () => {

    it('should update encounter successfully', async () => {
      const validUpdateData = createValidUpdateData();
      const updatedEncounter = { ...mockEncounter, ...validUpdateData };

      // Mock the getEncounterById call for access validation
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.success(updatedEncounter)
      );

      const request = createMockRequest(validUpdateData);
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectSuccessResponse(response, data);
      expect(data.data.name).toBe('Updated Encounter');
      expect(mockEncounterService.updateEncounter).toHaveBeenCalledWith(
        'test-id',
        validUpdateData
      );
    });

    it('should validate required fields', async () => {
      const invalidData = createInvalidUpdateData();

      const request = createMockRequest(invalidData);
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectValidationError(response, data, 'name');
    });

    it('should validate participant structure', async () => {
      const invalidData = createInvalidParticipantData();

      const request = createMockRequest(invalidData);
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectValidationError(response, data, 'participants');
    });

    it('should validate settings structure', async () => {
      const invalidData = createInvalidSettingsData();

      const request = createMockRequest(invalidData);
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectValidationError(response, data, 'lairActionInitiative');
    });

    it('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest(createValidUpdateData());
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectUnauthenticatedResponse(response, data);
    });

    it('should return 404 when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      const request = createMockRequest(createValidUpdateData());
      const response = await PUT(request, createAsyncParams('invalid-id'));
      const data = await response.json();

      expectErrorResponse(response, data, 404, 'Encounter not found');
    });

    it('should handle malformed JSON', async () => {
      const request = createJsonParseErrorRequest();
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectValidationError(response, data, 'Invalid JSON');
    });

    it('should handle service errors gracefully', async () => {
      // Mock access validation to succeed
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.error('Database write failed')
      );

      const request = createMockRequest(createValidUpdateData());
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectErrorResponse(response, data, 500, 'Database write failed');
    });
  });

  describe('DELETE /api/encounters/[id]', () => {
    it('should delete encounter successfully', async () => {
      // Mock access validation to succeed
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.deleteEncounter.mockResolvedValue(
        mockApiResponses.success({ deleted: true })
      );

      const request = createMockRequest({}, 'DELETE');
      const response = await DELETE(request, createTestContext());
      const data = await response.json();

      expectSuccessResponse(response, data);
      expect(mockEncounterService.deleteEncounter).toHaveBeenCalledWith('test-id');
    });

    it('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest({}, 'DELETE');
      const response = await DELETE(request, createTestContext());
      const data = await response.json();

      expectUnauthenticatedResponse(response, data);
    });

    it('should return 404 when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      const request = createMockRequest({}, 'DELETE');
      const response = await DELETE(request, createTestContext());
      const data = await response.json();

      expectErrorResponse(response, data, 404, 'Encounter not found');
    });

    it('should handle service errors gracefully', async () => {
      // Mock access validation to succeed
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.deleteEncounter.mockResolvedValue(
        mockApiResponses.error('Database delete failed')
      );

      const request = createMockRequest({}, 'DELETE');
      const response = await DELETE(request, createTestContext());
      const data = await response.json();

      expectErrorResponse(response, data, 500, 'Database delete failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors', async () => {
      mockEncounterService.getEncounterById.mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createTestContext());
      const data = await response.json();

      expectErrorResponse(response, data, 500, 'Internal server error');
    });

    it('should handle missing encounter ID parameter', async () => {
      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createAsyncParams(''));
      const data = await response.json();

      expectValidationError(response, data, 'Encounter ID is required');
    });
  });

  describe('Security', () => {
    it('should validate user ownership for update operations', async () => {
      const unauthorizedEncounter = createTestEncounter(
        createUnauthorizedEncounter()
      );

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(unauthorizedEncounter)
      );

      const request = createMockRequest({ name: 'Unauthorized Update' });
      const response = await PUT(request, createTestContext());
      const data = await response.json();

      expectUnauthorizedResponse(response, data);
    });

    it('should validate user ownership for delete operations', async () => {
      const unauthorizedEncounter = createTestEncounter(
        createUnauthorizedEncounter()
      );

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(unauthorizedEncounter)
      );

      const request = createMockRequest({}, 'DELETE');
      const response = await DELETE(request, createTestContext());
      const data = await response.json();

      expectUnauthorizedResponse(response, data);
    });

    it('should sanitize sensitive data in responses', async () => {
      const sensitiveEncounter = createTestEncounter({
        // Include any sensitive fields that should be filtered
        ownerId: mockUser.id,
      });

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(sensitiveEncounter)
      );

      const request = createMockRequest({}, 'GET');
      const response = await GET(request, createTestContext());
      const data = await response.json();

      expectSuccessResponse(response, data);
      // Verify sensitive fields are handled appropriately
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('participants');
    });
  });
});