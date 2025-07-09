import { NextRequest } from 'next/server';
import { POST } from '../route';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { Types } from 'mongoose';

// Mock the service
jest.mock('@/lib/services/EncounterServiceImportExport');

const mockService = EncounterServiceImportExport as jest.Mocked<typeof EncounterServiceImportExport>;

// Test data generation helpers
const createMockImportData = (overrides: any = {}) => ({
  metadata: {
    exportedAt: new Date().toISOString(),
    exportedBy: 'user123',
    format: 'json',
    version: '1.0.0',
    appVersion: '1.0.0',
    ...overrides.metadata,
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
    ...overrides.encounter,
  },
});

const createMockEncounter = (overrides: any = {}) => ({
  _id: new Types.ObjectId(),
  name: 'Imported Encounter',
  description: 'Test import',
  participants: [{ name: 'Test Character' }],
  ...overrides,
});

const createRequestBody = (data: string, format: string = 'json', options: any = null) => ({
  data,
  format,
  ...(options !== null && { options }),
});

const createNextRequest = (body: any) => ({
  json: jest.fn().mockResolvedValue(body),
  method: 'POST',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  url: 'http://localhost:3000/api/encounters/import',
}) as unknown as NextRequest;

const createDefaultOptions = (overrides: any = {}) => ({
  ownerId: 'temp-user-id',
  preserveIds: false,
  createMissingCharacters: true,
  overwriteExisting: false,
  ...overrides,
});

const expectSuccessResponse = async (response: Response, expectedName: string = 'Imported Encounter', expectedParticipantCount: number = 1) => {
  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData.success).toBe(true);
  expect(responseData.encounter.name).toBe(expectedName);
  expect(responseData.encounter.participantCount).toBe(expectedParticipantCount);
};

const expectErrorResponse = async (response: Response, expectedStatus: number, expectedError: string, expectedDetails?: string) => {
  expect(response.status).toBe(expectedStatus);
  const responseData = await response.json();
  expect(responseData.error).toBe(expectedError);
  if (expectedDetails) {
    expect(responseData.details).toBe(expectedDetails);
  }
};

describe('/api/encounters/import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should import encounter from JSON successfully', async () => {
      // Arrange
      const mockImportData = createMockImportData();
      const mockEncounter = createMockEncounter();

      mockService.importFromJson.mockResolvedValue({
        success: true,
        data: mockEncounter as any,
      });

      const requestBody = createRequestBody(
        JSON.stringify(mockImportData),
        'json',
        {
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        }
      );

      const request = createNextRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      await expectSuccessResponse(response);

      expect(mockService.importFromJson).toHaveBeenCalledWith(
        JSON.stringify(mockImportData),
        createDefaultOptions({
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        })
      );
    });

    it('should import encounter from XML successfully', async () => {
      // Arrange
      const mockEncounter = createMockEncounter();
      const xmlData = '<encounter><name>Test</name></encounter>';

      mockService.importFromXml.mockResolvedValue({
        success: true,
        data: mockEncounter as any,
      });

      const requestBody = createRequestBody(xmlData, 'xml', {
        createMissingCharacters: true,
      });

      const request = createNextRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      await expectSuccessResponse(response);

      expect(mockService.importFromXml).toHaveBeenCalledWith(
        xmlData,
        createDefaultOptions({ createMissingCharacters: true })
      );
    });

    it('should use default options when not provided', async () => {
      // Arrange
      const mockImportData = createMockImportData();
      const mockEncounter = createMockEncounter({ name: 'Test', participants: [] });

      mockService.importFromJson.mockResolvedValue({
        success: true,
        data: mockEncounter as any,
      });

      const requestBody = createRequestBody(JSON.stringify(mockImportData));
      const request = createNextRequest(requestBody);

      // Act
      await POST(request);

      // Assert
      expect(mockService.importFromJson).toHaveBeenCalledWith(
        JSON.stringify(mockImportData),
        createDefaultOptions()
      );
    });

    it('should return error when import fails', async () => {
      // Arrange
      const mockImportData = createMockImportData();

      mockService.importFromJson.mockResolvedValue({
        success: false,
        error: {
          message: 'Import failed',
          code: 'IMPORT_ERROR',
          details: 'Invalid data format',
        },
      });

      const requestBody = createRequestBody(JSON.stringify(mockImportData));
      const request = createNextRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      await expectErrorResponse(response, 400, 'Import failed', 'Invalid data format');
    });

    it('should handle service exceptions', async () => {
      // Arrange
      const mockImportData = createMockImportData();

      mockService.importFromJson.mockRejectedValue(new Error('Service error'));

      const requestBody = createRequestBody(JSON.stringify(mockImportData));
      const request = createNextRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      await expectErrorResponse(response, 500, 'Internal server error');
    });

    it('should validate request body', async () => {
      // Arrange
      const invalidRequestBody = createRequestBody(''); // Empty data
      const request = createNextRequest(invalidRequestBody);

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
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost:3000/api/encounters/import',
      } as unknown as NextRequest;

      // Act
      const response = await POST(request);

      // Assert
      await expectErrorResponse(response, 500, 'Internal server error');
    });
  });
});