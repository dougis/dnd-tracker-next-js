/**
 * @jest-environment jsdom
 */
import { makeRequest } from '../apiUtils';

// Mock fetch
global.fetch = jest.fn();

describe('apiUtils', () => {
  let mockSetIsLoading: jest.Mock;
  let mockSetError: jest.Mock;
  let mockOnEncounterUpdate: jest.Mock;

  beforeEach(() => {
    mockSetIsLoading = jest.fn();
    mockSetError = jest.fn();
    mockOnEncounterUpdate = jest.fn();
    (fetch as jest.Mock).mockClear();
  });

  describe('makeRequest', () => {
    it('should make successful API request', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          encounter: { id: 'test-encounter' }
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        method: 'POST',
        body: { test: 'data' },
        setIsLoading: mockSetIsLoading,
        setError: mockSetError,
        onEncounterUpdate: mockOnEncounterUpdate
      };

      const result = await makeRequest(config);

      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(fetch).toHaveBeenCalledWith('/test/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' })
      });
      expect(mockOnEncounterUpdate).toHaveBeenCalledWith({ id: 'test-encounter' });
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      expect(result).toEqual({
        success: true,
        encounter: { id: 'test-encounter' }
      });
    });

    it('should use default method PATCH when not specified', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
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
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
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
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          message: 'API Error Message'
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
      };

      await expect(makeRequest(config)).rejects.toThrow('API Error Message');
      expect(mockSetError).toHaveBeenCalledWith('API Error Message');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle API error without message', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({})
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
      };

      await expect(makeRequest(config)).rejects.toThrow('Failed to update encounter');
      expect(mockSetError).toHaveBeenCalledWith('Failed to update encounter');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
      };

      await expect(makeRequest(config)).rejects.toThrow('Network error');
      expect(mockSetError).toHaveBeenCalledWith('Network error');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should handle unknown errors', async () => {
      (fetch as jest.Mock).mockRejectedValue('Unknown error');

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
      };

      await expect(makeRequest(config)).rejects.toBe('Unknown error');
      expect(mockSetError).toHaveBeenCalledWith('An unexpected error occurred');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    it('should not call onEncounterUpdate when no encounter in response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true
          // No encounter field
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError,
        onEncounterUpdate: mockOnEncounterUpdate
      };

      await makeRequest(config);

      expect(mockOnEncounterUpdate).not.toHaveBeenCalled();
    });

    it('should not call onEncounterUpdate when success is false', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          encounter: { id: 'test-encounter' }
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError,
        onEncounterUpdate: mockOnEncounterUpdate
      };

      await makeRequest(config);

      expect(mockOnEncounterUpdate).not.toHaveBeenCalled();
    });

    it('should work without onEncounterUpdate callback', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          encounter: { id: 'test-encounter' }
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        url: '/test/url',
        setIsLoading: mockSetIsLoading,
        setError: mockSetError
        // No onEncounterUpdate
      };

      const result = await makeRequest(config);

      expect(result).toEqual({
        success: true,
        encounter: { id: 'test-encounter' }
      });
    });
  });
});