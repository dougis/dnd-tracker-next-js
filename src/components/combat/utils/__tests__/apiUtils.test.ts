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

    // Specific test cases that require custom logic
    it('should not call onEncounterUpdate when success is false', async () => {
      await executeApiTest(makeRequest, {
        url: '/test/url',
        shouldSucceed: false,
        callbacks: mockCallbacks
      });

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