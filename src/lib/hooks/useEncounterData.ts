import { useState, useEffect } from 'react';
import { EncounterService } from '@/lib/services/EncounterService';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

/**
 * Custom hook for managing encounter data loading and state
 */
export function useEncounterData(encounterId: string) {
  const [encounter, setEncounter] = useState<IEncounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEncounter = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await EncounterService.getEncounterById(encounterId);

      if (result.success && result.data) {
        setEncounter(result.data);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to load encounter');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncounter();
  }, [encounterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    loadEncounter();
  };

  return {
    encounter,
    loading,
    error,
    handleRetry,
  };
}