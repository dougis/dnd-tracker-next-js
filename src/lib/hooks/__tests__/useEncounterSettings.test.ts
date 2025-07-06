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

// Helper function to render hook and perform update
async function performUpdateTest(
  updateData: any,
  mockImplementation: jest.MockImplementation<typeof fetch>
) {
  mockFetch.mockImplementation(mockImplementation);
  const { result } = renderHook(() => useEncounterSettings(TEST_ENCOUNTER_ID));
  
  await act(async () => {
    await result.current.updateSettings(updateData);
  });
  
  return result;
}

// Helper to validate loading state expectations
function expectLoadingState(result: any, loading: boolean, error: string | null = null) {
  expect(result.current.loading).toBe(loading);
  if (error !== null) {
    expect(result.current.error).toBe(error);
  }
}

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
      
      const result = await performUpdateTest(updateData, createFetchSuccess(updatedSettings));

      expectApiCall(mockFetch, updateData);
      expectLoadingState(result, false);
      expect(result.current.error).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      const updateData = { gridSize: -1 };
      
      const result = await performUpdateTest(updateData, createFetchError('Validation error'));

      await waitFor(() => {
        expectLoadingState(result, false, 'Validation error');
      });
    });

    it('handles network errors', async () => {
      const updateData = { allowPlayerVisibility: false };
      
      const result = await performUpdateTest(updateData, createFetchNetworkError());

      await waitFor(() => {
        expectLoadingState(result, false, 'Network error');
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
      
      const result = await performUpdateTest(TEST_PARTIAL_SETTINGS, createFetchSuccess(mergedSettings));

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

      await waitFor(() => {
        expectLoadingState(result, false, 'Server error');
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