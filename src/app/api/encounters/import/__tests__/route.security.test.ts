import { NextRequest } from 'next/server';
import { POST } from '../route';
import { auth } from '@/lib/auth';

// Mock the auth function
jest.mock('@/lib/auth');
const mockAuth = auth as jest.MockedFunction<typeof auth>;

// Mock the EncounterServiceImportExport
jest.mock('@/lib/services/EncounterServiceImportExport', () => ({
  EncounterServiceImportExport: {
    importFromJson: jest.fn(),
    importFromXml: jest.fn(),
  },
}));

describe('/api/encounters/import - Security Tests', () => {
  const mockRequestBody = {
    data: '{"name":"Test Encounter","description":"Test"}',
    format: 'json',
    options: {
      preserveIds: false,
      createMissingCharacters: true,
      overwriteExisting: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Requirements', () => {
    it('should return 401 when no session exists', async () => {
      // Mock no session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/encounters/import', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Authentication required');
    });

    it('should return 401 when session exists but has no user ID', async () => {
      // Mock session without user ID
      mockAuth.mockResolvedValue({
        user: {
          email: 'test@example.com',
          // Missing ID
        },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/encounters/import', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Authentication required');
    });

    it('should use actual user ID from session when authenticated', async () => {
      const testUserId = 'user-123';
      
      // Mock valid session
      mockAuth.mockResolvedValue({
        user: {
          id: testUserId,
          email: 'test@example.com',
        },
      } as any);

      // Mock successful import
      const { EncounterServiceImportExport } = require('@/lib/services/EncounterServiceImportExport');
      EncounterServiceImportExport.importFromJson.mockResolvedValue({
        success: true,
        data: {
          _id: 'encounter-123',
          name: 'Test Encounter',
          description: 'Test',
          participants: [],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/encounters/import', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify that the service was called with the correct user ID
      expect(EncounterServiceImportExport.importFromJson).toHaveBeenCalledWith(
        mockRequestBody.data,
        expect.objectContaining({
          ownerId: testUserId,
          preserveIds: false,
          createMissingCharacters: true,
          overwriteExisting: false,
        })
      );
    });

    it('should not use hardcoded temp-user-id', async () => {
      const testUserId = 'user-456';
      
      // Mock valid session
      mockAuth.mockResolvedValue({
        user: {
          id: testUserId,
          email: 'test@example.com',
        },
      } as any);

      // Mock successful import
      const { EncounterServiceImportExport } = require('@/lib/services/EncounterServiceImportExport');
      EncounterServiceImportExport.importFromJson.mockResolvedValue({
        success: true,
        data: {
          _id: 'encounter-123',
          name: 'Test Encounter',
          description: 'Test',
          participants: [],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/encounters/import', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);
      
      // Verify that the service was NOT called with temp-user-id
      expect(EncounterServiceImportExport.importFromJson).not.toHaveBeenCalledWith(
        mockRequestBody.data,
        expect.objectContaining({
          ownerId: 'temp-user-id',
        })
      );
      
      // Verify it WAS called with the actual user ID
      expect(EncounterServiceImportExport.importFromJson).toHaveBeenCalledWith(
        mockRequestBody.data,
        expect.objectContaining({
          ownerId: testUserId,
        })
      );
    });
  });
});