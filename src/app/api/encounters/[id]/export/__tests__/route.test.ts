// Test file for export route
import { GET } from '../route';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
// Auth utilities available from shared-test-utilities
import {
  setupEncounterApiTest,
  createMockRequest,
  mockExportSuccess,
  mockExportFailure,
  mockServiceException,
  expectExportSuccess,
  expectErrorResponse,
  expectServerError,
} from '../../../__tests__/shared-test-utilities';

// Mock the service and auth
jest.mock('@/lib/services/EncounterServiceImportExport');
jest.mock('@/lib/auth');

const mockService = EncounterServiceImportExport as jest.Mocked<typeof EncounterServiceImportExport>;
// Auth mocking handled by shared utilities

describe('/api/encounters/[id]/export', () => {
  beforeEach(() => {
    setupEncounterApiTest();
  });

  describe('GET', () => {
    it('should export encounter to JSON successfully', async () => {
      // Arrange
      const mockExportData = '{"metadata":{"format":"json"},"encounter":{"name":"Test"}}';
      mockExportSuccess(mockService, mockExportData);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export?format=json'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      const response = await GET(request, { params });

      // Assert
      const responseData = await expectExportSuccess(response, 'json');
      expect(responseData).toBe(mockExportData);
    });

    it('should export encounter to XML successfully', async () => {
      // Arrange
      const mockExportData = '<?xml version="1.0"?><encounter><name>Test</name></encounter>';
      mockExportSuccess(mockService, '{}'); // JSON export will be overridden below
      mockService.exportToXml.mockResolvedValue({
        success: true,
        data: mockExportData,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export?format=xml'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      const response = await GET(request, { params });

      // Assert
      const responseData = await expectExportSuccess(response, 'xml');
      expect(responseData).toBe(mockExportData);
    });

    it('should handle export options correctly', async () => {
      // Arrange
      mockExportSuccess(mockService, '{}');

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export?format=json&includeCharacterSheets=true&includePrivateNotes=true&stripPersonalData=true'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      await GET(request, { params });

      // Assert
      expect(mockService.exportToJson).toHaveBeenCalledWith(
        '123',
        'test-user-123',
        {
          includeCharacterSheets: true,
          includePrivateNotes: true,
          includeIds: false,
          stripPersonalData: true,
        }
      );
    });

    it('should use default options when not provided', async () => {
      // Arrange
      mockExportSuccess(mockService, '{}');

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      await GET(request, { params });

      // Assert
      expect(mockService.exportToJson).toHaveBeenCalledWith(
        '123',
        'test-user-123',
        {
          includeCharacterSheets: false,
          includePrivateNotes: false,
          includeIds: false,
          stripPersonalData: false,
        }
      );
    });

    it('should return error when export fails', async () => {
      // Arrange
      mockExportFailure(mockService, { message: 'Export failed', code: 'EXPORT_ERROR' });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      const response = await GET(request, { params });

      // Assert
      await expectErrorResponse(response, 400, 'Export failed');
    });

    it('should handle service exceptions', async () => {
      // Arrange
      mockServiceException(mockService, 'Service error');

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      const response = await GET(request, { params });

      // Assert
      await expectServerError(response);
    });

    it('should handle invalid query parameters', async () => {
      // Arrange
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/encounters/123/export?format=invalid'
      });
      const params = Promise.resolve({ id: '123' });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});