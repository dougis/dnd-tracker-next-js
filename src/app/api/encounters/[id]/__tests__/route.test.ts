import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { EncounterService } from '@/lib/services/EncounterService';
import { auth } from '@/lib/auth';
import { Types } from 'mongoose';
import {
  createTestEncounter,
  createTestParticipant,
  mockApiResponses,
} from '@/app/encounters/[id]/__tests__/test-helpers';

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

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Test Encounter');
      expect(mockEncounterService.getEncounterById).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/invalid-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'invalid-id' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Encounter not found');
    });

    it('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle service errors gracefully', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });
  });

  describe('PUT /api/encounters/[id]', () => {
    const validUpdateData = {
      name: 'Updated Encounter',
      description: 'Updated description',
      difficulty: 'hard',
      estimatedDuration: 90,
      targetLevel: 6,
      participants: [
        {
          characterId: new Types.ObjectId().toString(),
          name: 'Updated Player',
          type: 'pc',
          maxHitPoints: 60,
          currentHitPoints: 60,
          temporaryHitPoints: 0,
          armorClass: 18,
          initiative: undefined,
          isPlayer: true,
          isVisible: true,
          notes: '',
          conditions: [],
          position: undefined,
        },
      ],
      tags: ['updated', 'test'],
      settings: {
        allowPlayerVisibility: true,
        autoRollInitiative: true,
        trackResources: true,
        enableLairActions: false,
        lairActionInitiative: undefined,
        enableGridMovement: false,
        gridSize: 5,
        roundTimeLimit: undefined,
        experienceThreshold: undefined,
      },
    };

    it('should update encounter successfully', async () => {
      // Create data with valid ObjectId inside the test
      const testValidUpdateData = {
        ...validUpdateData,
        participants: [
          {
            ...validUpdateData.participants[0],
            characterId: new Types.ObjectId().toString(),
          },
        ],
      };

      const updatedEncounter = { ...mockEncounter, ...testValidUpdateData };

      // Mock the getEncounterById call for access validation
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.success(updatedEncounter)
      );

      const request = {
        json: jest.fn().mockResolvedValue(testValidUpdateData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Encounter');
      expect(mockEncounterService.updateEncounter).toHaveBeenCalledWith(
        'test-id',
        testValidUpdateData
      );
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validUpdateData, name: '' };

      const request = {
        json: jest.fn().mockResolvedValue(invalidData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('name');
    });

    it('should validate participant structure', async () => {
      const invalidData = {
        ...validUpdateData,
        participants: [
          {
            name: 'Invalid Participant',
            // Missing required fields
          },
        ],
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('participants');
    });

    it('should validate settings structure', async () => {
      const invalidData = {
        ...validUpdateData,
        settings: {
          ...validUpdateData.settings,
          enableLairActions: true,
          // Missing lairActionInitiative when lair actions enabled
        },
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('lairActionInitiative');
    });

    it('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 404 when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/invalid-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'invalid-id' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Encounter not found');
    });

    it('should handle malformed JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid JSON');
    });

    it('should handle service errors gracefully', async () => {
      // Mock access validation to succeed
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.error('Database write failed')
      );

      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/test-id',
      } as unknown as NextRequest;

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database write failed');
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

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockEncounterService.deleteEncounter).toHaveBeenCalledWith('test-id');
    });

    it('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 404 when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Encounter not found');
    });

    it('should handle service errors gracefully', async () => {
      // Mock access validation to succeed
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success({ ...mockEncounter, ownerId: mockUser.id })
      );

      mockEncounterService.deleteEncounter.mockResolvedValue(
        mockApiResponses.error('Database delete failed')
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database delete failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors', async () => {
      mockEncounterService.getEncounterById.mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle missing encounter ID parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/encounters/');
      const response = await GET(request, { params: Promise.resolve({ id: '' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Encounter ID is required');
    });
  });

  describe('Security', () => {
    it('should validate user ownership for update operations', async () => {
      const unauthorizedEncounter = createTestEncounter({
        ownerId: 'different-user-id',
      });

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(unauthorizedEncounter)
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Unauthorized Update' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should validate user ownership for delete operations', async () => {
      const unauthorizedEncounter = createTestEncounter({
        ownerId: 'different-user-id',
      });

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(unauthorizedEncounter)
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should sanitize sensitive data in responses', async () => {
      const sensitiveEncounter = createTestEncounter({
        // Include any sensitive fields that should be filtered
        ownerId: mockUser.id,
      });

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(sensitiveEncounter)
      );

      const request = new NextRequest('http://localhost:3000/api/encounters/test-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Verify sensitive fields are handled appropriately
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('participants');
    });
  });
});