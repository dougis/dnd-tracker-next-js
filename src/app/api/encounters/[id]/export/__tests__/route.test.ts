import { NextRequest } from 'next/server';
import { GET } from '../route';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { auth } from '@/lib/auth';

// Mock the service and auth
jest.mock('@/lib/services/EncounterServiceImportExport');
jest.mock('@/lib/auth');

const mockService = EncounterServiceImportExport as jest.Mocked<typeof EncounterServiceImportExport>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/encounters/[id]/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful authentication for all tests
    mockAuth.mockResolvedValue({
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
      },
    } as any);
  });

  describe('GET', () => {
    it('should export encounter to JSON successfully', async () => {
      // Arrange
      const mockExportData = '{"metadata":{"format":"json"},"encounter":{"name":"Test"}}';
      mockService.exportToJson.mockResolvedValue({
        success: true,
        data: mockExportData,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export?format=json'
      );
      const params = { id: '123' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('.json');

      const responseData = await response.text();
      expect(responseData).toBe(mockExportData);
    });

    it('should export encounter to XML successfully', async () => {
      // Arrange
      const mockExportData = '<?xml version="1.0"?><encounter><name>Test</name></encounter>';
      mockService.exportToXml.mockResolvedValue({
        success: true,
        data: mockExportData,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export?format=xml'
      );
      const params = { id: '123' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/xml');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('.xml');

      const responseData = await response.text();
      expect(responseData).toBe(mockExportData);
    });

    it('should handle export options correctly', async () => {
      // Arrange
      mockService.exportToJson.mockResolvedValue({
        success: true,
        data: '{}',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export?format=json&includeCharacterSheets=true&includePrivateNotes=true&stripPersonalData=true'
      );
      const params = { id: '123' };

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
      mockService.exportToJson.mockResolvedValue({
        success: true,
        data: '{}',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export'
      );
      const params = { id: '123' };

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
      mockService.exportToJson.mockResolvedValue({
        success: false,
        error: { message: 'Export failed', code: 'EXPORT_ERROR' },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export'
      );
      const params = { id: '123' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(400);

      const responseData = await response.json();
      expect(responseData.error).toBe('Export failed');
    });

    it('should handle service exceptions', async () => {
      // Arrange
      mockService.exportToJson.mockRejectedValue(new Error('Service error'));

      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export'
      );
      const params = { id: '123' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.error).toBe('Internal server error');
    });

    it('should handle invalid query parameters', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/encounters/123/export?format=invalid'
      );
      const params = { id: '123' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(500);
    });
  });
});