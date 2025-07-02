import '../__test-helpers__/test-setup';
import { UserServiceProfile } from '../UserServiceProfile';
import User from '../../models/User';
import { checkProfileUpdateConflicts } from '../UserServiceHelpers';
import { UserAlreadyExistsError } from '../UserServiceErrors';
import {
  TEST_CONSTANTS,
  createMockUser,
  createMockPublicUser,
  MockServiceHelpers,
  AssertionHelpers,
  TestScenarios,
} from './UserServiceProfile.test-helpers';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../UserServiceHelpers');
jest.mock('../UserServiceValidation');
jest.mock('../UserServiceDatabase');
jest.mock('../UserServiceLookup');
jest.mock('../UserServiceResponseHelpers');

const MockedUser = jest.mocked(User);
const mockCheckProfileUpdateConflicts = jest.mocked(checkProfileUpdateConflicts);

/**
 * Tests for UserServiceProfile deletion functionality and private helper methods
 * Covers deleteUser method and tests private helper methods via reflection
 */
describe('UserServiceProfile - Deletion & Helper Methods', () => {
  const mockUser = createMockUser();
  const _mockPublicUser = createMockPublicUser();

  beforeEach(() => {
    jest.clearAllMocks();
    MockedUser.findById = jest.fn();
    MockedUser.findByIdAndDelete = jest.fn();
  });

  describe('deleteUser', () => {
    it('should successfully delete user when user exists', async () => {
      const mockLookup = MockServiceHelpers.getMockLookup();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();

      mockLookup.findUserOrError.mockResolvedValue({
        success: true,
        data: mockUser,
      });
      MockedUser.findByIdAndDelete.mockResolvedValue(mockUser);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: undefined,
      });

      const result = await UserServiceProfile.deleteUser(TEST_CONSTANTS.mockUserId);

      AssertionHelpers.expectSuccessResult(result, undefined);
      expect(mockLookup.findUserOrError).toHaveBeenCalledWith(TEST_CONSTANTS.mockUserId);
      expect(MockedUser.findByIdAndDelete).toHaveBeenCalledWith(TEST_CONSTANTS.mockUserId);
    });

    it('should return error when user is not found for deletion', async () => {
      const { mockLookup: _mockLookup } = await TestScenarios.testFailedRetrieval(
        UserServiceProfile.deleteUser,
        [TEST_CONSTANTS.mockUserId],
        'USER_NOT_FOUND',
        'User not found'
      );

      expect(MockedUser.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should handle database errors during user deletion', async () => {
      const mockLookup = MockServiceHelpers.getMockLookup();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
      const databaseError = new Error('Database connection failed');

      mockLookup.findUserOrError.mockResolvedValue({
        success: true,
        data: mockUser,
      });
      MockedUser.findByIdAndDelete.mockRejectedValue(databaseError);
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'Failed to delete user', code: 'USER_DELETION_FAILED', statusCode: 500 },
      });

      const result = await UserServiceProfile.deleteUser(TEST_CONSTANTS.mockUserId);

      AssertionHelpers.expectErrorResult(result, 'USER_DELETION_FAILED');
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        databaseError,
        'Failed to delete user',
        'USER_DELETION_FAILED'
      );
    });
  });

  describe('Private helper methods', () => {
    describe('findUserForProfileUpdate', () => {
      it('should return success result when user is found', async () => {
        const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
        MockedUser.findById.mockResolvedValue(mockUser);
        mockResponseHelpers.createSuccessResponse.mockReturnValue({
          success: true,
          data: mockUser,
        });

        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.findUserForProfileUpdate(TEST_CONSTANTS.mockUserId);

        AssertionHelpers.expectSuccessResult(result, mockUser);
        expect(MockedUser.findById).toHaveBeenCalledWith(TEST_CONSTANTS.mockUserId);
      });

      it('should return error result when user is not found', async () => {
        MockedUser.findById.mockResolvedValue(null);

        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.findUserForProfileUpdate(TEST_CONSTANTS.mockUserId);

        AssertionHelpers.expectErrorResult(result, 'USER_NOT_FOUND', `User not found: ${TEST_CONSTANTS.mockUserId}`);
        expect(result.error?.statusCode).toBe(404);
      });
    });

    describe('handleProfileUpdateConflicts', () => {
      it('should return null when no conflicts to check', async () => {
        const mockValidation = MockServiceHelpers.getMockValidation();
        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: undefined,
          usernameToCheck: undefined,
        });

        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.handleProfileUpdateConflicts(
          mockUser,
          { firstName: 'Test' }
        );

        expect(result).toBeNull();
        expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
      });

      it('should return error response when UserAlreadyExistsError is thrown', async () => {
        const mockValidation = MockServiceHelpers.getMockValidation();
        const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
        const conflictError = new UserAlreadyExistsError('email', 'test@example.com');

        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: 'test@example.com',
          usernameToCheck: undefined,
        });
        mockValidation.extractUserIdString.mockReturnValue(TEST_CONSTANTS.mockUserId);
        mockCheckProfileUpdateConflicts.mockRejectedValue(conflictError);
        mockResponseHelpers.createErrorResponse.mockReturnValue({
          success: false,
          error: { message: 'Email already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
        });

        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.handleProfileUpdateConflicts(
          mockUser,
          { email: 'test@example.com' }
        );

        expect(result?.success).toBe(false);
        expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
      });

      it('should propagate non-UserAlreadyExistsError', async () => {
        const mockValidation = MockServiceHelpers.getMockValidation();
        const databaseError = new Error('Database error');

        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: 'test@example.com',
          usernameToCheck: undefined,
        });
        mockValidation.extractUserIdString.mockReturnValue(TEST_CONSTANTS.mockUserId);
        mockCheckProfileUpdateConflicts.mockRejectedValue(databaseError);

        const UserServiceProfileClass = UserServiceProfile as any;
        await expect(
          UserServiceProfileClass.handleProfileUpdateConflicts(
            mockUser,
            { email: 'test@example.com' }
          )
        ).rejects.toThrow('Database error');
      });

      it('should return null when no conflicts are found', async () => {
        const mockValidation = MockServiceHelpers.getMockValidation();

        mockValidation.prepareConflictCheckParams.mockReturnValue({
          emailToCheck: 'new@example.com',
          usernameToCheck: undefined,
        });
        mockValidation.extractUserIdString.mockReturnValue(TEST_CONSTANTS.mockUserId);
        mockCheckProfileUpdateConflicts.mockResolvedValue(undefined);

        const UserServiceProfileClass = UserServiceProfile as any;
        const result = await UserServiceProfileClass.handleProfileUpdateConflicts(
          mockUser,
          { email: 'new@example.com' }
        );

        expect(result).toBeNull();
        expect(mockCheckProfileUpdateConflicts).toHaveBeenCalledWith(
          TEST_CONSTANTS.mockUserId,
          'new@example.com',
          undefined
        );
      });
    });
  });
});