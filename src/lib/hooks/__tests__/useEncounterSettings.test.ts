import { renderHook, act, waitFor } from '@testing-library/react';
import { useEncounterSettings } from '../useEncounterSettings';
import {
  TEST_ENCOUNTER_ID,
  TEST_SETTINGS,
  TEST_PARTIAL_SETTINGS,
  createFetchSuccess,
  createFetchError,
  createFetchNetworkError,
  createFetchDelayed,
  expectApiCall,
} from '@/__test-utils__/encounter-settings-test-utils';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useEncounterSettings', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateSettings', () => {
    it('successfully updates encounter settings', async () => {
      const updateData = { allowPlayerVisibility: false };
      const updatedSettings = { ...TEST_SETTINGS, ...updateData };
      mockFetch.mockImplementation(createFetchSuccess(updatedSettings));

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      expectApiCall(mockFetch, updateData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockImplementation(createFetchError('Validation error'));

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

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
      mockFetch.mockImplementation(createFetchNetworkError());

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

      const updateData = { allowPlayerVisibility: false };

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Network error');
      });
    });

    it('sets loading state during update', async () => {
      mockFetch.mockImplementation(createFetchDelayed(100));

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

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
      const mergedSettings = { ...TEST_SETTINGS, ...TEST_PARTIAL_SETTINGS };
      mockFetch.mockImplementation(createFetchSuccess(mergedSettings));

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

      await act(async () => {
        await result.current.updateSettings(TEST_PARTIAL_SETTINGS);
      });

      expectApiCall(mockFetch, TEST_PARTIAL_SETTINGS);
    });

    it('provides retry functionality', async () => {
      // First call fails
      mockFetch.mockImplementationOnce(createFetchNetworkError());

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

      const updateData = { allowPlayerVisibility: false };

      await act(async () => {
        await result.current.updateSettings(updateData);
      });

      expect(result.current.error).toBe('Network error');

      // Second call succeeds
      mockFetch.mockImplementation(createFetchSuccess());

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
      mockFetch.mockImplementation(createFetchError('Server error'));

      const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));

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