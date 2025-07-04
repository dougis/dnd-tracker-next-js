/**
 * Shared utilities for testing service operations and reducing duplication
 */

/**
 * Creates mock service handlers for encounter operations
 */
export const createMockServiceHandlers = () => ({
  handleDuplicate: jest.fn(),
  handleDelete: jest.fn(),
  handleArchive: jest.fn(),
  handleView: jest.fn(),
  handleEdit: jest.fn(),
  handleShare: jest.fn(),
  handleStartCombat: jest.fn(),
});

/**
 * Creates mock navigation handlers
 */
export const createMockNavigationHandlers = () => ({
  handleView: jest.fn(),
  handleEdit: jest.fn(),
  handleStartCombat: jest.fn(),
  handleShare: jest.fn(),
});

/**
 * Creates mock encounter service
 */
export const createMockEncounterService = () => ({
  cloneEncounter: jest.fn(),
  deleteEncounter: jest.fn(),
  archiveEncounter: jest.fn(),
  updateEncounter: jest.fn(),
  getEncounter: jest.fn(),
});

/**
 * Common error scenarios for testing
 */
export const createErrorScenario = (errorMessage = 'Test error') => {
  return new Error(errorMessage);
};

/**
 * Mock success/error handlers setup
 */
export const createMockHandlers = () => ({
  onSuccess: jest.fn(),
  onError: jest.fn(),
  onComplete: jest.fn(),
});