/**
 * @jest-environment jsdom
 */
import { makeRequest } from '../apiUtils';
import {
  createMockCallbacks,
  executeApiTest,
  generateApiTestCases
} from './__test-helpers__/combatTestHelpers';

// Mock fetch
global.fetch = jest.fn();

describe('apiUtils', () => {
  let mockCallbacks: ReturnType<typeof createMockCallbacks>;

  beforeEach(() => {
    mockCallbacks = createMockCallbacks();
    (fetch as jest.Mock).mockClear();
  });

  describe('makeRequest', () => {
    // Data-driven tests to eliminate duplication
    const testCases = generateApiTestCases();

    testCases.forEach(testCase => {
      it(testCase.name, async () => {
        await executeApiTest(makeRequest, {
          ...testCase.config,
          callbacks: mockCallbacks
        });
      });
    });

    // Error handling behavior tests
    it('should handle errors gracefully without rethrowing', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Test API error' })
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const requestConfig = {
        url: '/test/url',
        method: 'PATCH',
        ...mockCallbacks
      };

      // Should NOT throw error - this is the key change
      const result = await makeRequest(requestConfig);

      // Verify error state is set
      expect(mockCallbacks.setError).toHaveBeenCalledWith('Test API error');
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(true);
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(false);

      // Should return undefined or null since error was handled
      expect(result).toBeUndefined();
    });

    it('should handle network errors gracefully without rethrowing', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const requestConfig = {
        url: '/test/url',
        method: 'GET',
        ...mockCallbacks
      };

      // Should NOT throw error
      const result = await makeRequest(requestConfig);

      // Verify error state is set with the network error message
      expect(mockCallbacks.setError).toHaveBeenCalledWith('Network failure');
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(true);
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(false);

      // Should return undefined since error was handled
      expect(result).toBeUndefined();
    });

    // Specific test cases that require custom logic
    it('should not call onEncounterUpdate when success is false', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Test error' })
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const requestConfig = {
        url: '/test/url',
        ...mockCallbacks
      };

      await makeRequest(requestConfig);

      expect(mockCallbacks.onEncounterUpdate).not.toHaveBeenCalled();
    });

    it('should work without onEncounterUpdate callback', async () => {
      const result = await executeApiTest(makeRequest, {
        url: '/test/url',
        callbacks: {
          ...mockCallbacks,
          onEncounterUpdate: undefined
        }
      });

      // Should not throw error when onEncounterUpdate is undefined
      expect(result).toBeDefined();
    });
  });
});