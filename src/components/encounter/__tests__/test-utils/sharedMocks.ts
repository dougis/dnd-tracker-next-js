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
 * Standard toast hook mock factory
 */
export const createToastHookMock = (mockToast: jest.Mock) => () => ({
  useToast: () => ({
    toast: mockToast,
  }),
});

/**
 * Standard utils mock factory  
 */
export const createUtilsMockFactory = () => () => ({
  getEncounterText: jest.fn((count: number) =>
    `${count} encounter${count !== 1 ? 's' : ''}`
  ),
});

/**
 * Standard error utils mock factory
 */
export const createErrorUtilsMockFactory = () => () => ({
  createSuccessHandler: jest.fn((toast) => jest.fn((action, target) => {
    toast({
      title: `Encounter ${action}d`,
      description: `"${target}" has been ${action}d successfully.`,
    });
  })),
  createErrorHandler: jest.fn((toast) => jest.fn((action) => {
    toast({
      title: 'Error',
      description: `Failed to ${action} encounter. Please try again.`,
      variant: 'destructive',
    });
  })),
});