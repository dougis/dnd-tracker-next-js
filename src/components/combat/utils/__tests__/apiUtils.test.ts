/**
 * @jest-environment jsdom
 */
import { makeRequest } from '../apiUtils';
import { createMockResponse, createMockErrorResponse, createMockCallbacks } from './__test-helpers__/combatTestHelpers';

// Mock fetch
global.fetch = jest.fn();

describe('apiUtils', () => {
  let mockCallbacks: ReturnType<typeof createMockCallbacks>;

  beforeEach(() => {
    mockCallbacks = createMockCallbacks();
    (fetch as jest.Mock).mockClear();
  });

  describe('makeRequest', () => {
    it('should make successful API request', async () => {
      const testEncounter = { id: 'test-encounter' };
      const mockResponse = createMockResponse(true, testEncounter);
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        method: 'POST',
        body: { test: 'data' },
        ...mockCallbacks
      };

      const result = await makeRequest(config);

      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(true);
      expect(mockCallbacks.setError).toHaveBeenCalledWith(null);
      expect(fetch).toHaveBeenCalledWith('/test/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' })
      });
      expect(mockCallbacks.onEncounterUpdate).toHaveBeenCalledWith(testEncounter);
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(false);
      expect(result).toEqual({
        success: true,
        encounter: testEncounter
      });
    });

    it('should use default method PATCH when not specified', async () => {
      const mockResponse = createMockResponse();
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockCallbacks.setIsLoading,
        setError: mockCallbacks.setError
      };

      await makeRequest(config);

      expect(fetch).toHaveBeenCalledWith('/test/url', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined
      });
    });

    it('should handle request without body', async () => {
      const mockResponse = createMockResponse();
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockCallbacks.setIsLoading,
        setError: mockCallbacks.setError
      };

      await makeRequest(config);

      expect(fetch).toHaveBeenCalledWith('/test/url', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined
      });
    });

    it('should handle API error responses', async () => {
      const mockResponse = createMockErrorResponse('API Error Message');
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        ...mockCallbacks
      };

      await expect(makeRequest(config)).rejects.toThrow('API Error Message');
      expect(mockCallbacks.setError).toHaveBeenCalledWith('API Error Message');
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle API error without message', async () => {
      const mockResponse = createMockErrorResponse();
      mockResponse.json.mockResolvedValue({});
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        ...mockCallbacks
      };

      await expect(makeRequest(config)).rejects.toThrow('Failed to update encounter');
      expect(mockCallbacks.setError).toHaveBeenCalledWith('Failed to update encounter');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const config = {
        url: '/test/url',
        ...mockCallbacks
      };

      await expect(makeRequest(config)).rejects.toThrow('Network error');
      expect(mockCallbacks.setError).toHaveBeenCalledWith('Network error');
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle unknown errors', async () => {
      (fetch as jest.Mock).mockRejectedValue('Unknown error');

      const config = {
        url: '/test/url',
        ...mockCallbacks
      };

      await expect(makeRequest(config)).rejects.toBe('Unknown error');
      expect(mockCallbacks.setError).toHaveBeenCalledWith('An unexpected error occurred');
      expect(mockCallbacks.setIsLoading).toHaveBeenCalledWith(false);
    });

    it('should not call onEncounterUpdate when no encounter in response', async () => {
      const mockResponse = createMockResponse(true, null);
      mockResponse.json.mockResolvedValue({ success: true });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        ...mockCallbacks
      };

      await makeRequest(config);

      expect(mockCallbacks.onEncounterUpdate).not.toHaveBeenCalled();
    });

    it('should not call onEncounterUpdate when success is false', async () => {
      const mockResponse = createMockResponse(false, { id: 'test-encounter' });
      mockResponse.json.mockResolvedValue({
        success: false,
        encounter: { id: 'test-encounter' }
      });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        ...mockCallbacks
      };

      await makeRequest(config);

      expect(mockCallbacks.onEncounterUpdate).not.toHaveBeenCalled();
    });

    it('should work without onEncounterUpdate callback', async () => {
      const testEncounter = { id: 'test-encounter' };
      const mockResponse = createMockResponse(true, testEncounter);
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockCallbacks.setIsLoading,
        setError: mockCallbacks.setError
        // No onEncounterUpdate
      };

      const result = await makeRequest(config);

      expect(result).toEqual({
        success: true,
        encounter: testEncounter
      });
    });
  });
});