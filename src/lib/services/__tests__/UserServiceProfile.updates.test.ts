import '../__test-helpers__/test-setup';
import { UserServiceProfile } from '../UserServiceProfile';
import User from '../../models/User';
import { checkProfileUpdateConflicts } from '../UserServiceHelpers';
import { UserAlreadyExistsError } from '../UserServiceErrors';
import {
  TEST_CONSTANTS,
  createMockUser,
  createMockPublicUser,
  createMockUpdateData,
  MockServiceHelpers,
  AssertionHelpers,
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
 * Tests for UserServiceProfile profile update functionality
 * Covers updateUserProfile method with various scenarios
 */
describe('UserServiceProfile - Profile Updates', () => {
  const mockUser = createMockUser();
  const mockPublicUser = createMockPublicUser();
  const updateData = createMockUpdateData();

  beforeEach(() => {
    jest.clearAllMocks();
    MockedUser.findById = jest.fn();
  });

  describe('updateUserProfile', () => {
    it('should successfully update user profile with valid data', async () => {
      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockDatabase = MockServiceHelpers.getMockDatabase();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();

      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      AssertionHelpers.expectSuccessResult(result, mockPublicUser);
      expect(mockValidation.validateAndParseProfileUpdate).toHaveBeenCalledWith(updateData);
      expect(MockedUser.findById).toHaveBeenCalledWith(TEST_CONSTANTS.mockUserId);
      AssertionHelpers.expectDatabaseUpdate(mockDatabase, mockUser, updateData);
    });

    it('should return error when user is not found for profile update', async () => {
      const mockValidation = MockServiceHelpers.getMockValidation();
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      MockedUser.findById.mockResolvedValue(null);

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      AssertionHelpers.expectErrorResult(result, 'USER_NOT_FOUND', `User not found: ${TEST_CONSTANTS.mockUserId}`);
      expect(result.error?.statusCode).toBe(404);
    });

    it('should handle email conflicts during profile update', async () => {
      // For this test, we'll test the general error handling path
      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
      const conflictError = new UserAlreadyExistsError('email', 'existing@example.com');

      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
        throw conflictError;
      });
      mockResponseHelpers.createErrorResponse.mockReturnValue({
        success: false,
        error: { message: 'Email already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
      });

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      expect(result.success).toBe(false);
      expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
    });

    it('should handle username conflicts during profile update', async () => {
      // For this test, we'll test the general error handling path
      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
      const conflictError = new UserAlreadyExistsError('username', 'existinguser');

      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockImplementation(() => {
        throw conflictError;
      });
      mockResponseHelpers.createErrorResponse.mockReturnValue({
        success: false,
        error: { message: 'Username already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
      });

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      expect(result.success).toBe(false);
      expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
    });

    it('should skip conflict check when no email or username changes', async () => {
      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockDatabase = MockServiceHelpers.getMockDatabase();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();

      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      AssertionHelpers.expectSuccessResult(result, mockPublicUser);
      expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
    });

    it('should handle user without _id property during conflict check', async () => {
      const userWithoutId = { ...mockUser };
      delete (userWithoutId as any)._id;

      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockDatabase = MockServiceHelpers.getMockDatabase();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();

      MockedUser.findById.mockResolvedValue(userWithoutId);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: 'new@example.com',
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockResolvedValue(undefined);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      AssertionHelpers.expectSuccessResult(result, mockPublicUser);
      expect(mockCheckProfileUpdateConflicts).not.toHaveBeenCalled();
    });

    it('should handle general database errors during profile update', async () => {
      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockDatabase = MockServiceHelpers.getMockDatabase();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
      const databaseError = new Error('Database connection failed');

      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });

      // Simulate database error during update operation
      mockDatabase.updateUserFieldsAndSave.mockRejectedValue(databaseError);
      mockResponseHelpers.handleCustomError.mockReturnValue({
        success: false,
        error: { message: 'Failed to update user profile', code: 'PROFILE_UPDATE_FAILED', statusCode: 500 },
      });

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      expect(result.success).toBe(false);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        databaseError,
        'Failed to update user profile',
        'PROFILE_UPDATE_FAILED'
      );
    });

    it('should handle validation errors during profile update', async () => {
      const validationError = new Error('Invalid data');
      MockServiceHelpers.setupValidationError(validationError);

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      AssertionHelpers.expectErrorResult(result);
    });

    it('should handle UserAlreadyExistsError thrown during update process', async () => {
      const mockValidation = MockServiceHelpers.getMockValidation();
      const mockDatabase = MockServiceHelpers.getMockDatabase();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();
      const conflictError = new UserAlreadyExistsError('email', 'test@example.com');

      MockedUser.findById.mockResolvedValue(mockUser);
      mockValidation.validateAndParseProfileUpdate.mockReturnValue(updateData);
      mockValidation.prepareConflictCheckParams.mockReturnValue({
        emailToCheck: undefined,
        usernameToCheck: undefined,
      });
      mockDatabase.updateUserFieldsAndSave.mockRejectedValue(conflictError);
      mockResponseHelpers.createErrorResponse.mockReturnValue({
        success: false,
        error: { message: 'Email already exists', code: 'USER_ALREADY_EXISTS', statusCode: 409 },
      });

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, updateData);

      AssertionHelpers.expectErrorResult(result);
      expect(mockResponseHelpers.createErrorResponse).toHaveBeenCalledWith(conflictError);
    });

    it('should handle null update data', async () => {
      const nullDataError = new Error('Update data is required');
      MockServiceHelpers.setupValidationError(nullDataError);

      const result = await UserServiceProfile.updateUserProfile(TEST_CONSTANTS.mockUserId, null as any);

      AssertionHelpers.expectErrorResult(result);
    });
  });
});