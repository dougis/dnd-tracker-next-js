import { DELETE } from '../route';
import { UserService } from '@/lib/services/UserService';
import { auth } from '@/lib/auth';
import {
  SHARED_API_TEST_CONSTANTS,
  expectSuccessResponse,
  expectErrorResponse,
  expectAuthenticationError,
  expectAuthorizationError,
  setupAPITestWithAuth,
  createRouteTestExecutor
} from '@/lib/test-utils/shared-api-test-helpers';

// Mock dependencies
jest.mock('@/lib/services/UserService');
jest.mock('@/lib/auth');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('DELETE /api/users/[id]/profile', () => {
  const TEST_USER_ID = SHARED_API_TEST_CONSTANTS.TEST_USER_ID;
  const executeDeleteRequest = createRouteTestExecutor(DELETE, '/api/users');

  beforeEach(() => {
    setupAPITestWithAuth(mockAuth, mockUserService);
  });

  describe('Successful deletion', () => {
    it('should delete user account successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const response = await executeDeleteRequest();

      await expectSuccessResponse(response, {
        message: 'Account deleted successfully',
      });
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(TEST_USER_ID);
    });
  });

  describe('Authentication validation', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await executeDeleteRequest();

      await expectAuthenticationError(response);
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should return 403 when user tries to delete different account', async () => {
      const differentUserId = '507f1f77bcf86cd799439012';
      setupAPITestWithAuth(mockAuth, mockUserService, differentUserId);

      const response = await executeDeleteRequest();

      await expectAuthorizationError(response);
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('Service errors', () => {
    it('should handle user not found error', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
        message: 'User not found',
      });

      const response = await executeDeleteRequest();

      await expectErrorResponse(response, 404, 'User not found');
    });

    it('should handle deletion failure', async () => {
      mockUserService.deleteUser.mockResolvedValue({
        success: false,
        error: { code: 'USER_DELETION_FAILED' },
        message: 'Failed to delete user',
      });

      const response = await executeDeleteRequest();

      await expectErrorResponse(response, 500, 'Account deletion failed');
    });

    it('should handle unexpected errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Database connection failed'));

      const response = await executeDeleteRequest();

      await expectErrorResponse(response, 500, 'Internal server error');
    });
  });

});