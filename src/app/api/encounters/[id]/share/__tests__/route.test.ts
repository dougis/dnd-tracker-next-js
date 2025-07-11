import { NextRequest } from 'next/server';
import { POST } from '../route';
import { auth } from '@/lib/auth';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';

// Mock the auth function
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock the EncounterServiceImportExport
jest.mock('@/lib/services/EncounterServiceImportExport', () => ({
  EncounterServiceImportExport: {
    generateShareableLink: jest.fn(),
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGenerateShareableLink = EncounterServiceImportExport.generateShareableLink as jest.MockedFunction<
  typeof EncounterServiceImportExport.generateShareableLink
>;

describe('/api/encounters/[id]/share', () => {
  const encounterId = 'encounter123';
  const userId = 'user123';
  const shareUrl = 'https://example.com/share/abc123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should require authentication', async () => {
      // Mock unauthenticated session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({ expiresIn: 86400000 }),
      });

      const params = Promise.resolve({ id: encounterId });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(mockGenerateShareableLink).not.toHaveBeenCalled();
    });

    it('should require session with user ID', async () => {
      // Mock session without user ID
      mockAuth.mockResolvedValue({ user: {} } as any);

      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({ expiresIn: 86400000 }),
      });

      const params = Promise.resolve({ id: encounterId });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(mockGenerateShareableLink).not.toHaveBeenCalled();
    });

    it('should generate shareable link with authenticated user ID', async () => {
      // Mock authenticated session
      mockAuth.mockResolvedValue({
        user: { id: userId, email: 'test@example.com' },
        expires: new Date(Date.now() + 3600000).toISOString(),
      });

      // Mock successful service response
      mockGenerateShareableLink.mockResolvedValue({
        success: true,
        data: shareUrl,
      });

      const expiresIn = 86400000; // 24 hours
      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({ expiresIn }),
      });

      const params = Promise.resolve({ id: encounterId });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.shareUrl).toBe(shareUrl);
      expect(data.expiresAt).toBeDefined();

      // Verify service was called with correct user ID
      expect(mockGenerateShareableLink).toHaveBeenCalledWith(encounterId, userId, expiresIn);
    });

    it('should validate request body schema', async () => {
      // Mock authenticated session
      mockAuth.mockResolvedValue({
        user: { id: userId, email: 'test@example.com' },
        expires: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({ expiresIn: 30000 }), // Too short, below minimum
      });

      const params = Promise.resolve({ id: encounterId });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(mockGenerateShareableLink).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Mock authenticated session
      mockAuth.mockResolvedValue({
        user: { id: userId, email: 'test@example.com' },
        expires: new Date(Date.now() + 3600000).toISOString(),
      });

      // Mock service error
      mockGenerateShareableLink.mockResolvedValue({
        success: false,
        error: { message: 'Encounter not found' },
      });

      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({ expiresIn: 86400000 }),
      });

      const params = Promise.resolve({ id: encounterId });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Encounter not found');
    });

    it('should use default expiresIn when not provided', async () => {
      // Mock authenticated session
      mockAuth.mockResolvedValue({
        user: { id: userId, email: 'test@example.com' },
        expires: new Date(Date.now() + 3600000).toISOString(),
      });

      // Mock successful service response
      mockGenerateShareableLink.mockResolvedValue({
        success: true,
        data: shareUrl,
      });

      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({}), // No expiresIn provided
      });

      const params = Promise.resolve({ id: encounterId });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify service was called with default value (24 hours)
      expect(mockGenerateShareableLink).toHaveBeenCalledWith(encounterId, userId, 24 * 60 * 60 * 1000);
    });

    it('should prevent cross-user access by using authenticated user ID', async () => {
      const authenticatedUserId = 'user123';
      const otherUserId = 'user456';

      // Mock authenticated session for user123
      mockAuth.mockResolvedValue({
        user: { id: authenticatedUserId, email: 'test@example.com' },
        expires: new Date(Date.now() + 3600000).toISOString(),
      });

      // Mock successful service response
      mockGenerateShareableLink.mockResolvedValue({
        success: true,
        data: shareUrl,
      });

      const request = new NextRequest('http://localhost:3000/api/encounters/encounter123/share', {
        method: 'POST',
        body: JSON.stringify({ expiresIn: 86400000 }),
      });

      const params = Promise.resolve({ id: encounterId });
      await POST(request, { params });

      // Verify the service was called with the authenticated user ID, not any other user ID
      expect(mockGenerateShareableLink).toHaveBeenCalledWith(encounterId, authenticatedUserId, 86400000);
      expect(mockGenerateShareableLink).not.toHaveBeenCalledWith(encounterId, otherUserId, expect.any(Number));
    });
  });
});