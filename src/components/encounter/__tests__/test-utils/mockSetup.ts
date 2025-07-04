/**
 * Common mock setup utilities for encounter tests
 * Eliminates duplication of mock configurations across test files
 */

/**
 * Creates mock toast function for tests
 */
export const createMockToast = () => jest.fn();

/**
 * Common mock setup for the toast hook
 */
export const mockToastHook = (mockToast = createMockToast()) => {
  jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
      toast: mockToast,
    }),
  }));
  return mockToast;
};

/**
 * Common console spy setup
 */
export const createConsoleSpy = () => jest.spyOn(console, 'log').mockImplementation(() => {});

/**
 * Common cleanup for console spy
 */
export const restoreConsoleSpy = (spy: jest.SpyInstance) => {
  spy.mockRestore();
};

/**
 * Common beforeEach setup for test suites
 */
export const commonBeforeEach = () => {
  jest.clearAllMocks();
};

/**
 * Common afterAll setup for test suites with console spy
 */
export const commonAfterAll = (consoleSpy: jest.SpyInstance) => {
  consoleSpy.mockRestore();
};