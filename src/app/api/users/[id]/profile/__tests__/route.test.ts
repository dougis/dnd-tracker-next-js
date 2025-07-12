import { PATCH, GET } from '../route';
import { UserService } from '@/lib/services/UserService';
import { auth } from '@/lib/auth';
import {
  SHARED_API_TEST_CONSTANTS,
  createMockUser,
  createRequestBody,
  expectSuccessResponse,
  expectErrorResponse,
  setupAPITestWithAuth,
  createRouteTestExecutor
} from '@/lib/test-utils/shared-api-test-helpers';

// Mock dependencies
jest.mock('@/lib/services/UserService');
jest.mock('@/lib/auth');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/users/[id]/profile', () => {
  const TEST_USER_ID = SHARED_API_TEST_CONSTANTS.TEST_USER_ID;
  const routeExecutor = createRouteTestExecutor(PATCH, '/api/users');
  const getExecutor = createRouteTestExecutor(GET, '/api/users');

  beforeEach(() => {
    setupAPITestWithAuth(mockAuth, mockUserService);
  });

  describe('PATCH /api/users/[id]/profile', () => {
    it('should update user profile successfully', async () => {
      const mockUpdatedUser = createMockUser();
      const requestBody = createRequestBody();

      mockUserService.updateUserProfile.mockResolvedValue({
        success: true,
        data: mockUpdatedUser,
      });

      const response = await routeExecutor(TEST_USER_ID, requestBody, 'PATCH');

      await expectSuccessResponse(response, {
        message: 'Profile updated successfully',
        user: mockUpdatedUser,
      });

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(
        TEST_USER_ID,
        requestBody
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await routeExecutor(TEST_USER_ID, { displayName: 'Test' }, 'PATCH');

      await expectErrorResponse(response, 401, 'Authentication required');
      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to update another user\'s profile', async () => {
      const differentUserId = '507f1f77bcf86cd799439012';
      setupAPITestWithAuth(mockAuth, mockUserService, differentUserId);

      const response = await routeExecutor(TEST_USER_ID, { displayName: 'Test' }, 'PATCH');

      await expectErrorResponse(response, 403, 'You can only access your own profile');
      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        displayName: '', // Invalid - empty string
        experienceLevel: 'invalid', // Invalid enum value
      };

      const response = await routeExecutor(TEST_USER_ID, invalidData, 'PATCH');

      await expectErrorResponse(response, 400, 'Validation error', true);
      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should handle UserService errors', async () => {
      mockUserService.updateUserProfile.mockResolvedValue({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      });

      const response = await routeExecutor(TEST_USER_ID, { displayName: 'Test' }, 'PATCH');

      await expectErrorResponse(response, 404, 'User not found');
    });
  });

  describe('GET /api/users/[id]/profile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = createMockUser();

      mockUserService.getUserById.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const response = await getExecutor(TEST_USER_ID, undefined, 'GET');

      await expectSuccessResponse(response, { user: mockUser });
      expect(mockUserService.getUserById).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await getExecutor(TEST_USER_ID, undefined, 'GET');

      await expectErrorResponse(response, 401, 'Authentication required');
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to view another user\'s profile', async () => {
      const differentUserId = '507f1f77bcf86cd799439012';
      setupAPITestWithAuth(mockAuth, mockUserService, differentUserId);

      const response = await getExecutor(TEST_USER_ID, undefined, 'GET');

      await expectErrorResponse(response, 403, 'You can only access your own profile');
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 404 when user is not found', async () => {
      mockUserService.getUserById.mockResolvedValue({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      });

      const response = await getExecutor(TEST_USER_ID, undefined, 'GET');

      await expectErrorResponse(response, 404, 'User not found');
    });
  });
});