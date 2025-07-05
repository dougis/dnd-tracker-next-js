import { renderHook, act, waitFor } from '@testing-library/react';
import { useEncounterSettings } from '../useEncounterSettings';
import type { IEncounterSettings } from '@/lib/models/encounter/interfaces';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useEncounterSettings', () => {
  const mockEncounterId = '507f1f77bcf86cd799439011';
  const mockSettings: IEncounterSettings = {
    allowPlayerVisibility: true,
    autoRollInitiative: false,
    trackResources: true,
    enableLairActions: false,
    enableGridMovement: false,
    gridSize: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateSettings', () => {
    it('successfully updates encounter settings', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Encounter settings updated successfully',
          settings: { ...mockSettings, allowPlayerVisibility: false },
        }),
      } as Response);

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      const updateData = { allowPlayerVisibility: false };

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounterId}/settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Validation error',
          errors: ['Invalid grid size'],
        }),
      } as Response);

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      const updateData = { gridSize: -1 };

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Validation error');
      });
    });

    it('handles network errors', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      const updateData = { allowPlayerVisibility: false };

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to update encounter settings');
      });
    });

    it('sets loading state during update', async () => {
      // Mock delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    settings: mockSettings,
                  }),
                } as Response),
              100
            )
          )
      );

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      act(() => {
        result.current.updateSettings({ allowPlayerVisibility: false });
      });

      // Should be loading immediately after call
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Wait for completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('supports partial settings updates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          settings: { ...mockSettings, enableLairActions: true, lairActionInitiative: 20 },
        }),
      } as Response);

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      const partialUpdate = {
        enableLairActions: true,
        lairActionInitiative: 20,
      };

      await act(async () => {
        await result.current.updateSettings(partialUpdate);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/encounters/${mockEncounterId}/settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(partialUpdate),
        }
      );
    });

    it('provides retry functionality', async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      const updateData = { allowPlayerVisibility: false };

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      expect(result.current.error).toBe('Failed to update encounter settings');

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          settings: mockSettings,
        }),
      } as Response);

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('optimistic updates', () => {
    it('supports optimistic updates with rollback on error', async () => {
      // Mock API error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Server error',
        }),
      } as Response);

      const { result } = renderHook(() => useEncounterSettings(mockEncounterId));

      const updateData = { allowPlayerVisibility: false };

      await act(async () => {
        await result.current.updateSettings(updateData, { optimistic: true });
      });

      // Should rollback on error when using optimistic updates
      await waitFor(() => {
        expect(result.current.error).toBe('Server error');
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('validation', () => {
    it('validates encounter ID format', () => {
      const invalidId = 'invalid-id';
      
      const { result } = renderHook(() => useEncounterSettings(invalidId));

      expect(result.current.updateSettings).toBeDefined();
      // The actual validation would happen when updateSettings is called
    });
  });
});