/**
 * Shared mock configurations for BatchActions tests
 * Eliminates all duplicate mock setups across test files
 */

import { createMockToast } from './mockSetup';

/**
 * Create standard mock instances for BatchActions tests
 */
export const createStandardMocks = () => {
  const mockToast = createMockToast();
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  return { mockToast, mockFetch };
};

/**
 * Standard jest.mock configuration for utils
 */
export const standardUtilsMock = () => ({
  getEncounterText: jest.fn((count: number) =>
    `${count} encounter${count !== 1 ? 's' : ''}`
  ),
});

/**
 * Standard jest.mock configuration for error utils
 */
export const standardErrorUtilsMock = (toast: jest.Mock) => ({
  createSuccessHandler: jest.fn((toastFn) => jest.fn((action, target) => {
    toastFn({
      title: `Encounter ${action}d`,
      description: `"${target}" has been ${action}d successfully.`,
    });
  })),
  createErrorHandler: jest.fn((toastFn) => jest.fn((action) => {
    toastFn({
      title: 'Error',
      description: `Failed to ${action} encounter. Please try again.`,
      variant: 'destructive',
    });
  })),
});