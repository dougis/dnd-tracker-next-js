import { NextRequest } from 'next/server';
import { POST } from '../route';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { Types } from 'mongoose';

// Mock the service
jest.mock('@/lib/services/EncounterServiceImportExport');

const mockService = EncounterServiceImportExport as jest.Mocked<typeof EncounterServiceImportExport>;

describe('/api/encounters/import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const mockImportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'user123',
        format: 'json',
        version: '1.0.0',
        appVersion: '1.0.0',
      },
      encounter: {
        name: 'Imported Encounter',
        description: 'Test import',
        tags: ['test'],
        difficulty: 'medium',
        estimatedDuration: 30,
        targetLevel: 3,
        status: 'draft',
        isPublic: false,
        settings: {
          allowPlayerVisibility: true,
          autoRollInitiative: false,
          trackResources: true,
          enableLairActions: false,
          enableGridMovement: false,
          gridSize: 5,
        },
        participants: [
          {
            id: 'temp-1',
            name: 'Test Character',
            type: 'pc',
            maxHitPoints: 25,
            currentHitPoints: 25,
            temporaryHitPoints: 0,
            armorClass: 15,
            isPlayer: true,
            isVisible: true,
            notes: '',
            conditions: [],
          },
        ],
      },
    };

    it('should import encounter from JSON successfully', async () => {
      // Arrange
      const mockEncounter = {
        _id: new Types.ObjectId(),
        name: 'Imported Encounter',
        description: 'Test import',
        participants: [{ name: 'Test Character' }],
      };

      mockService.importFromJson.mockResolvedValue({
        success: true,
        data: mockEncounter as any,
      });

      const requestBody = {
        data: JSON.stringify(mockImportData),
        format: 'json',
        options: {
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        },
      };

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.encounter.name).toBe('Imported Encounter');
      expect(responseData.encounter.participantCount).toBe(1);

      expect(mockService.importFromJson).toHaveBeenCalledWith(
        JSON.stringify(mockImportData),
        {
          ownerId: 'temp-user-id',
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        }
      );
    });

    it('should import encounter from XML successfully', async () => {
      // Arrange
      const mockEncounter = {
        _id: new Types.ObjectId(),
        name: 'Imported Encounter',
        description: 'Test import',
        participants: [{ name: 'Test Character' }],
      };

      mockService.importFromXml.mockResolvedValue({
        success: true,
        data: mockEncounter as any,
      });

      const requestBody = {
        data: '<encounter><name>Test</name></encounter>',
        format: 'xml',
        options: {
          createMissingCharacters: true,
        },
      };

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);

      expect(mockService.importFromXml).toHaveBeenCalledWith(
        '<encounter><name>Test</name></encounter>',
        {
          ownerId: 'temp-user-id',
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        }
      );
    });

    it('should use default options when not provided', async () => {
      // Arrange
      mockService.importFromJson.mockResolvedValue({
        success: true,
        data: { _id: new Types.ObjectId(), name: 'Test', participants: [] } as any,
      });

      const requestBody = {
        data: JSON.stringify(mockImportData),
        format: 'json',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      await POST(request);

      // Assert
      expect(mockService.importFromJson).toHaveBeenCalledWith(
        JSON.stringify(mockImportData),
        {
          ownerId: 'temp-user-id',
          preserveIds: false,
          createMissingCharacters: true,
          overwriteExisting: false,
        }
      );
    });

    it('should return error when import fails', async () => {
      // Arrange
      mockService.importFromJson.mockResolvedValue({
        success: false,
        error: {
          message: 'Import failed',
          code: 'IMPORT_ERROR',
          details: 'Invalid data format',
        },
      });

      const requestBody = {
        data: JSON.stringify(mockImportData),
        format: 'json',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);

      const responseData = await response.json();
      expect(responseData.error).toBe('Import failed');
      expect(responseData.details).toBe('Invalid data format');
    });

    it('should handle service exceptions', async () => {
      // Arrange
      mockService.importFromJson.mockRejectedValue(new Error('Service error'));

      const requestBody = {
        data: JSON.stringify(mockImportData),
        format: 'json',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error).toBe('Internal server error');
    });

    it('should validate request body', async () => {
      // Arrange
      const invalidRequestBody = {
        data: '', // Empty data
        format: 'json',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: JSON.stringify(invalidRequestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);

      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid request data');
      expect(responseData.details).toContain('Import data is required');
    });

    it('should handle invalid JSON body', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/encounters/import',
        {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error).toBe('Internal server error');
    });
  });
});