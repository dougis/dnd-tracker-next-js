/**
 * Shared mock setup for BatchActions tests
 * Eliminates duplication of common mock configurations
 */

/**
 * Common mock setup for BatchActions utils
 */
export const setupBatchActionsMocks = () => {
  // Mock the utils - this is the same in both test files
  jest.mock('../../BatchActions/utils', () => ({
    getEncounterText: jest.fn((count: number) =>
      `${count} encounter${count !== 1 ? 's' : ''}`
    ),
  }));
};

/**
 * Common constants for test files
 */
export const COMMON_TEST_ENCOUNTERS = ['enc1', 'enc2', 'enc3'];
export const COMMON_TEST_COUNT = 3;