import '../__test-helpers__/test-setup';
import { UserServiceProfile } from '../UserServiceProfile';
import { UserNotFoundError } from '../UserServiceErrors';
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

/**
 * Tests for UserServiceProfile profile retrieval methods
 * Covers getUserById and getUserByEmail functionality
 */
describe('UserServiceProfile - Profile Retrieval', () => {
  const mockUser = createMockUser();
  const mockPublicUser = createMockPublicUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should successfully retrieve user by ID when user exists', async () => {
      await TestScenarios.testSuccessfulRetrieval(
        UserServiceProfile.getUserById,
        [TEST_CONSTANTS.mockUserId],
        mockUser,
        mockPublicUser
      );
    });

    it('should return error when user lookup fails', async () => {
      await TestScenarios.testFailedRetrieval(
        UserServiceProfile.getUserById,
        [TEST_CONSTANTS.mockUserId],
        'USER_NOT_FOUND',
        'User not found'
      );
    });

    it('should handle validation errors in getUserById', async () => {
      const validationError = new Error('Validation failed');
      const { mockResponseHelpers } = MockServiceHelpers.setupValidationErrorInRetrieval(validationError);

      const result = await UserServiceProfile.getUserById(TEST_CONSTANTS.mockUserId);

      AssertionHelpers.expectErrorResult(result);
      expect(mockResponseHelpers.handleValidationError).toHaveBeenCalledWith(validationError);
    });

    it('should handle custom errors when validation error handling throws', async () => {
      const customError = new Error('Database error');
      const { mockResponseHelpers } = MockServiceHelpers.setupCustomErrorInRetrieval(customError);

      const result = await UserServiceProfile.getUserById(TEST_CONSTANTS.mockUserId);

      AssertionHelpers.expectErrorResult(result);
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        customError,
        'User not found',
        'USER_NOT_FOUND',
        404
      );
    });

    it('should handle malformed user ID', async () => {
      const mockLookup = MockServiceHelpers.getMockLookup();
      const invalidIdError = new Error('Invalid ObjectId');
      mockLookup.findUserOrError.mockRejectedValue(invalidIdError);

      const result = await UserServiceProfile.getUserById('invalid-id');

      AssertionHelpers.expectErrorResult(result);
    });
  });

  describe('getUserByEmail', () => {
    it('should successfully retrieve user by email when user exists', async () => {
      const mockLookup = MockServiceHelpers.getMockLookup();
      const mockResponseHelpers = MockServiceHelpers.getMockResponseHelpers();

      mockLookup.findUserByEmailOrThrow.mockResolvedValue(mockUser);
      mockResponseHelpers.safeToPublicJSON.mockReturnValue(mockPublicUser);
      mockResponseHelpers.createSuccessResponse.mockReturnValue({
        success: true,
        data: mockPublicUser,
      });

      const result = await UserServiceProfile.getUserByEmail(TEST_CONSTANTS.mockEmail);

      AssertionHelpers.expectSuccessResult(result, mockPublicUser);
      expect(mockLookup.findUserByEmailOrThrow).toHaveBeenCalledWith(TEST_CONSTANTS.mockEmail);
    });

    it('should handle errors when user lookup by email fails', async () => {
      const lookupError = new UserNotFoundError(TEST_CONSTANTS.mockEmail);
      const { mockResponseHelpers } = MockServiceHelpers.setupEmailRetrievalError(lookupError);

      const result = await UserServiceProfile.getUserByEmail(TEST_CONSTANTS.mockEmail);

      AssertionHelpers.expectErrorResult(result, 'USER_RETRIEVAL_FAILED');
      expect(mockResponseHelpers.handleCustomError).toHaveBeenCalledWith(
        lookupError,
        'Failed to retrieve user',
        'USER_RETRIEVAL_FAILED'
      );
    });

    it('should handle empty email', async () => {
      const mockLookup = MockServiceHelpers.getMockLookup();
      const emptyEmailError = new Error('Email is required');
      mockLookup.findUserByEmailOrThrow.mockRejectedValue(emptyEmailError);

      const result = await UserServiceProfile.getUserByEmail('');

      AssertionHelpers.expectErrorResult(result);
    });
  });
});