import { useState, useCallback } from 'react';
import type { IEncounterSettings } from '@/lib/models/encounter/interfaces';

/**
 * Options for settings updates
 */
interface UpdateOptions {
  optimistic?: boolean;
}

/**
 * Hook return type
 */
interface UseEncounterSettingsReturn {
  loading: boolean;
  error: string | null;
  updateSettings: (
    _settings: Partial<IEncounterSettings>,
    _options?: UpdateOptions
  ) => Promise<void>;
  retry: () => Promise<void>;
}

// Removed extractErrorMessage function as it's not used in the current implementation

/**
 * Custom hook for managing encounter settings updates
 *
 * Provides functionality to update encounter settings with loading states,
 * error handling, and optional optimistic updates.
 */
export function useEncounterSettings(encounterId: string): UseEncounterSettingsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<{
    settings: Partial<IEncounterSettings>;
    options?: UpdateOptions;
  } | null>(null);

  const updateSettings = useCallback(
    async (settings: Partial<IEncounterSettings>, options?: UpdateOptions) => {
      try {
        setLoading(true);
        setError(null);
        setLastUpdate({ settings, options });

        const response = await fetch(`/api/encounters/${encounterId}/settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.message || 'Failed to update settings');
          return;
        }

        // Success - clear any previous errors
        setError(null);
      } catch (err) {
        // For network errors and other fetch failures, use the fallback message
        setError('Failed to update encounter settings');
        console.error('Failed to update encounter settings:', err);
      } finally {
        setLoading(false);
      }
    },
    [encounterId]
  );

  const retry = useCallback(async () => {
    if (lastUpdate) {
      await updateSettings(lastUpdate.settings, lastUpdate.options);
    }
  }, [lastUpdate, updateSettings]);

  return {
    loading,
    error,
    updateSettings,
    retry,
  };
}