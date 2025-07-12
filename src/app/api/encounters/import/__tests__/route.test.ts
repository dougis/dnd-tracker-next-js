import { NextRequest } from 'next/server';
import { POST } from '../route';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { auth } from '@/lib/auth';
import {
  setupEncounterApiTest,
  createMockRequest,
  createImportRequestBody,
  createDefaultImportOptions,
  mockImportSuccess,
  mockImportFailure,
  mockServiceException,
  expectImportSuccess,
  expectErrorResponse,
  expectValidationError,
  expectServerError,
  testAuthenticationRequired,
  testValidationError,
  testServiceException,
  createMockImportData,
  createMockEncounter,
  createMockXmlData,
} from '../../__tests__/shared-test-utilities';

// Mock the service and auth
jest.mock('@/lib/services/EncounterServiceImportExport');
jest.mock('@/lib/auth');

const mockService = EncounterServiceImportExport as jest.Mocked<typeof EncounterServiceImportExport>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;


describe('/api/encounters/import', () => {
  beforeEach(() => {
    setupEncounterApiTest();
  });

  describe('POST', () => {
    it('should import encounter from JSON successfully', async () => {
      // Arrange
      const mockImportData = createMockImportData();
      const mockEncounter = createMockEncounter();
      
      mockImportSuccess(mockService, mockEncounter);

      const requestBody = createImportRequestBody(
        JSON.stringify(mockImportData),
        'json',
        {
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        }
      );

      const request = createMockRequest({ body: requestBody });

      // Act
      const response = await POST(request);

      // Assert
      await expectImportSuccess(response);

      expect(mockService.importFromJson).toHaveBeenCalledWith(
        JSON.stringify(mockImportData),
        createDefaultImportOptions({
          createMissingCharacters: true,
          preserveIds: false,
          overwriteExisting: false,
        })
      );
    });

    it('should import encounter from XML successfully', async () => {
      // Arrange
      const mockEncounter = createMockEncounter();
      const xmlData = createMockXmlData();
      
      mockImportSuccess(mockService, mockEncounter);

      const requestBody = createImportRequestBody(xmlData, 'xml', {
        createMissingCharacters: true,
      });

      const request = createMockRequest({ body: requestBody });

      // Act
      const response = await POST(request);

      // Assert
      await expectImportSuccess(response);

      expect(mockService.importFromXml).toHaveBeenCalledWith(
        xmlData,
        createDefaultImportOptions({ createMissingCharacters: true })
      );
    });

    it('should use default options when not provided', async () => {
      // Arrange
      const mockImportData = createMockImportData();
      const mockEncounter = createMockEncounter({ name: 'Test', participants: [] });
      
      mockImportSuccess(mockService, mockEncounter);

      const requestBody = createImportRequestBody(JSON.stringify(mockImportData));
      const request = createMockRequest({ body: requestBody });

      // Act
      await POST(request);

      // Assert
      expect(mockService.importFromJson).toHaveBeenCalledWith(
        JSON.stringify(mockImportData),
        createDefaultImportOptions()
      );
    });

    it('should return error when import fails', async () => {
      // Arrange
      const mockImportData = createMockImportData();
      
      mockImportFailure(mockService, {
        message: 'Import failed',
        code: 'IMPORT_ERROR',
        details: 'Invalid data format',
      });

      const requestBody = createImportRequestBody(JSON.stringify(mockImportData));
      const request = createMockRequest({ body: requestBody });

      // Act
      const response = await POST(request);

      // Assert
      await expectErrorResponse(response, 400, 'Import failed', 'Invalid data format');
    });

    it('should handle service exceptions', async () => {
      // Arrange
      const mockImportData = createMockImportData();
      
      await testServiceException(
        POST,
        createImportRequestBody(JSON.stringify(mockImportData)),
        'Service error'
      );
    });

    it('should validate request body', async () => {
      // Arrange
      const invalidRequestBody = createImportRequestBody(''); // Empty data
      
      // Act & Assert
      await testValidationError(POST, invalidRequestBody, 'Import data is required');
    });

    it('should handle invalid JSON body', async () => {
      // Arrange
      setupEncounterApiTest();
      
      const request = createMockRequest({ body: undefined });
      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      // Act
      const response = await POST(request);

      // Assert
      await expectServerError(response);
    });
  });
});