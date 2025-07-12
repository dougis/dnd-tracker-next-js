import { NextRequest } from 'next/server';
import { POST } from '../route';
import { auth } from '@/lib/auth';
import {
  setupEncounterApiTest,
  mockAuthSuccess,
  mockAuthFailure,
  mockAuthIncomplete,
  createMockRequest,
  createImportRequestBody,
  expectAuthenticationError,
  TEST_USER,
} from '../../__tests__/shared-test-utilities';

// Mock the auth function
jest.mock('@/lib/auth');
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/encounters/import - Basic Security Tests', () => {
  beforeEach(() => {
    setupEncounterApiTest();
  });

  describe('Authentication Requirements', () => {
    it('should return 401 when no session exists', async () => {
      // Mock no session
      mockAuthFailure(mockAuth);

      const requestBody = createImportRequestBody('{"name":"Test"}', 'json');
      const request = createMockRequest({ body: requestBody });

      const response = await POST(request);
      await expectAuthenticationError(response);
    });

    it('should return 401 when session exists but has no user ID', async () => {
      // Mock session without user ID
      mockAuthIncomplete(mockAuth);

      const requestBody = createImportRequestBody('{"name":"Test"}', 'json');
      const request = createMockRequest({ body: requestBody });

      const response = await POST(request);
      await expectAuthenticationError(response);
    });

    it('should pass authentication when valid session exists', async () => {
      // Mock valid session
      mockAuthSuccess(mockAuth);

      const requestBody = createImportRequestBody('{"name":"Test"}', 'json');
      const request = createMockRequest({ body: requestBody });

      const response = await POST(request);

      // The key security test: authentication should pass and not return 401
      expect(response.status).not.toBe(401);

      // If there's an error, it should not be authentication-related
      if (response.status !== 200) {
        const data = await response.json();
        expect(data.message).not.toBe('Authentication required');
      }
    });
  });
});