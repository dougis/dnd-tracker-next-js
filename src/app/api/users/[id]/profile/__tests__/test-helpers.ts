// Re-export shared API test helpers to maintain backward compatibility
export {
  SHARED_API_TEST_CONSTANTS,
  createMockSession,
  createMockParams,
  createMockRequest,
  createMockUser,
  createRequestBody,
  expectSuccessResponse,
  expectErrorResponse,
  expectAuthenticationError,
  expectAuthorizationError,
  expectValidationError,
  expectServerError,
  setupAPITest,
  setupAPITestWithAuth,
  createRouteTestExecutor,
  executeTestRequest,
} from '@/lib/test-utils/shared-api-test-helpers';

// Legacy constant for backward compatibility
export const TEST_USER_ID = '507f1f77bcf86cd799439011';