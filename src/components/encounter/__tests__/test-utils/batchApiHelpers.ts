/**
 * Helper utilities for BatchActions API tests
 * Eliminates code duplication across batch operation test scenarios
 */

import { COMMON_TEST_ENCOUNTERS } from './batchActionsSharedMocks';
import { expectCallbacksInvoked, expectErrorToast } from './testSetup';

export interface MockBatchOptions {
  operation?: string;
  statusCode?: number;
  errorMessage?: string;
  successful?: number;
  failed?: number;
}

/**
 * Create a batch API response structure
 */
const createBatchApiResponse = (operation: string, successful: number, failed: number) => ({
  success: true,
  operation,
  results: Array.from({ length: successful }, (_, i) => ({
    encounterId: `enc${i + 1}`,
    status: 'success',
  })),
  errors: failed > 0 ? Array.from({ length: failed }, (_, i) => ({
    encounterId: `enc${successful + i + 1}`,
    status: 'error',
    error: 'Access denied',
  })) : [],
  summary: { totalProcessed: successful + failed, successful, failed },
});

/**
 * Generic mock response helper
 */
const mockBatchApiResponse = (response: any) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(response);
};

/**
 * Mock successful batch API response
 */
export const mockSuccessfulBatchApi = ({ operation = 'duplicate', successful = 3, failed = 0 }: MockBatchOptions = {}) => {
  mockBatchApiResponse({
    ok: true,
    json: async () => createBatchApiResponse(operation, successful, failed),
  });
};

/**
 * Mock partial failure batch API response
 */
export const mockPartialFailureBatchApi = ({ operation = 'duplicate', successful = 2, failed = 1 }: MockBatchOptions = {}) => {
  mockBatchApiResponse({
    ok: true,
    json: async () => createBatchApiResponse(operation, successful, failed),
  });
};

/**
 * Mock error batch API response
 */
export const mockErrorBatchApi = ({ statusCode = 500, errorMessage = 'Server error' }: MockBatchOptions = {}) => {
  mockBatchApiResponse({
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
  expectCallbacksInvoked(onClearSelection, onRefetch);
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
  expectCallbacksInvoked(onClearSelection, onRefetch);
};


/**
 * Expect empty selection error
 */
export const expectEmptySelectionError = (mockToast: jest.Mock, operation: string) => {
  expect(global.fetch).not.toHaveBeenCalled();
  expectErrorToast(mockToast, `No encounters selected for ${operation}.`);
};

/**
 * Common button click logic for operations
 */
const executeOperationClick = async (
  operation: string,
  clickButtonFn: (_selector: string | RegExp) => Promise<void>,
  isDeleteOperation = false
) => {
  if (isDeleteOperation) {
    await clickButtonFn(/delete/i);
    await clickButtonFn('Delete');
  } else {
    await clickButtonFn(new RegExp(operation, 'i'));
  }
};

/**
 * Execute a complete batch operation test with API verification
 */
export const executeBatchOperationTest = async (
  operation: string,
  mockSetupFn: () => void,
  renderFn: () => any,
  clickButtonFn: (_selector: string | RegExp) => Promise<void>,
  waitForFn: (_callback: () => void) => Promise<void>,
  mockToast: jest.Mock,
  onClearSelection: jest.Mock,
  onRefetch: jest.Mock,
  isDeleteOperation = false
) => {
  mockSetupFn();
  renderFn();

  await executeOperationClick(operation, clickButtonFn, isDeleteOperation);

  await waitForFn(() => {
    expectBatchApiCall(operation);
  });

  await waitForFn(() => {
    expectSuccessfulOperationResult(mockToast, operation, 3, onClearSelection, onRefetch);
  });
};

/**
 * Execute error handling test for batch operations
 */
export const executeBatchErrorTest = async (
  operation: string,
  errorMessage: string,
  mockSetupFn: () => void,
  renderFn: () => any,
  clickButtonFn: (_selector: string | RegExp) => Promise<void>,
  waitForFn: (_callback: () => void) => Promise<void>,
  mockToast: jest.Mock,
  isDeleteOperation = false
) => {
  mockSetupFn();
  renderFn();

  await executeOperationClick(operation, clickButtonFn, isDeleteOperation);

  await waitForFn(() => {
    expectErrorToast(mockToast, errorMessage);
  });
};