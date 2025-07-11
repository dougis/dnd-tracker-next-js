/**
 * Shared test setup utilities to reduce duplication across test files
 */
import { jest } from '@jest/globals';
import { useRouter } from 'next/navigation';
import { EncounterService } from '@/lib/services/EncounterService';

// Mock factory for router
export const createRouterMocks = () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  const setupMocks = () => {
    const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    } as any);
  };

  return { mockRouterPush, mockRouterBack, setupMocks };
};

// Mock factory for global browser APIs
export const setupGlobalMocks = () => {
  // Mock window.confirm
  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: jest.fn().mockReturnValue(true),
  });

  // Mock fetch
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });

  return {};
};

// Service mock factory
export const createServiceMocks = (mockData?: any) => {
  const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;

  return {
    mockEncounterService,
    setupSuccessfulMocks: (data = mockData) => {
      mockEncounterService.getEncounterById.mockResolvedValue({ success: true, data });
      mockEncounterService.updateEncounter.mockResolvedValue({ success: true, data });
    },
    setupUpdateSuccess: (data = mockData) => {
      mockEncounterService.updateEncounter.mockResolvedValue({ success: true, data });
    },
    setupUpdateError: (errorMessage: string = 'Failed to update encounter') => {
      mockEncounterService.updateEncounter.mockResolvedValue({
        success: false,
        error: errorMessage,
      });
    },
    setupControlledUpdate: () => {
      let resolvePromise: (_value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockEncounterService.updateEncounter.mockReturnValue(delayedPromise);
      return () => resolvePromise!({ success: true, data: {} });
    },
  };
};

// Common beforeEach setup
export const setupCommonTestMocks = () => {
  jest.clearAllMocks();
  setupGlobalMocks();
  const routerMocks = createRouterMocks();
  routerMocks.setupMocks();
  return routerMocks;
};