/**
 * Helper utilities for BatchActions API tests
 * Eliminates code duplication across batch operation test scenarios
 */

import { COMMON_TEST_ENCOUNTERS } from './batchActionsSharedMocks';

export interface MockBatchOptions {
  operation?: string;
  statusCode?: number;
  errorMessage?: string;
  successful?: number;
  failed?: number;
}

/**
 * Mock successful batch API response
 */
export const mockSuccessfulBatchApi = ({ operation = 'duplicate', successful = 3, failed = 0 }: MockBatchOptions = {}) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: true,
      operation,
      results: Array.from({ length: successful }, (_, i) => ({
        encounterId: `enc${i + 1}`,
        status: 'success',
      })),
      summary: { totalProcessed: successful + failed, successful, failed },
    }),
  });
};

/**
 * Mock partial failure batch API response
 */
export const mockPartialFailureBatchApi = ({ operation = 'duplicate', successful = 2, failed = 1 }: MockBatchOptions = {}) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: true,
      operation,
      results: Array.from({ length: successful }, (_, i) => ({
        encounterId: `enc${i + 1}`,
        status: 'success',
      })),
      errors: Array.from({ length: failed }, (_, i) => ({
        encounterId: `enc${successful + i + 1}`,
        status: 'error',
        error: 'Access denied',
      })),
      summary: { totalProcessed: successful + failed, successful, failed },
    }),
  });
};

/**
 * Mock error batch API response
 */
export const mockErrorBatchApi = ({ statusCode = 500, errorMessage = 'Server error' }: MockBatchOptions = {}) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: statusCode,
    json: async () => ({ error: errorMessage }),
  });
};

/**
 * Mock network error
 */
export const mockNetworkErrorBatchApi = (errorMessage = 'Network error') => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
};

/**
 * Expect correct batch API call
 */
export const expectBatchApiCall = (operation: string, encounterIds = COMMON_TEST_ENCOUNTERS) => {
  expect(global.fetch).toHaveBeenCalledWith('/api/encounters/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      encounterIds,
      options: {},
    }),
  });
};

/**
 * Expect successful operation result
 */
export const expectSuccessfulOperationResult = (
  mockToast: jest.Mock,
  operation: string,
  count = 3,
  onClearSelection: jest.Mock,
  onRefetch: jest.Mock
) => {
  expect(mockToast).toHaveBeenCalledWith({
    title: `Encounters ${operation}d`,
    description: `${count} encounters have been ${operation}d successfully.`,
  });
  expect(onClearSelection).toHaveBeenCalledTimes(1);
  expect(onRefetch).toHaveBeenCalledTimes(1);
};

/**
 * Expect partial success result
 */
export const expectPartialSuccessResult = (
  mockToast: jest.Mock,
  operation: string,
  successful = 2,
  failed = 1,
  onClearSelection: jest.Mock,
  onRefetch: jest.Mock
) => {
  expect(mockToast).toHaveBeenCalledWith({
    title: 'Partial Success',
    description: `${successful} encounters ${operation}d successfully, ${failed} failed.`,
  });
  expect(onClearSelection).toHaveBeenCalledTimes(1);
  expect(onRefetch).toHaveBeenCalledTimes(1);
};

/**
 * Expect error toast message
 */
export const expectErrorToast = (mockToast: jest.Mock, errorMessage: string) => {
  expect(mockToast).toHaveBeenCalledWith({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
};

/**
 * Expect empty selection error
 */
export const expectEmptySelectionError = (mockToast: jest.Mock, operation: string) => {
  expect(global.fetch).not.toHaveBeenCalled();
  expectErrorToast(mockToast, `No encounters selected for ${operation}.`);
};