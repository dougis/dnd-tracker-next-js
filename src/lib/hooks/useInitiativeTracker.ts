'use client';

import { useCallback, useState } from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';

interface UseInitiativeTrackerProps {
  encounter: IEncounter;
  onEncounterUpdate?: (_encounter: IEncounter) => void;
}

interface UseInitiativeTrackerReturn {
  isLoading: boolean;
  error: string | null;
  handleNextTurn: () => Promise<void>;
  handlePreviousTurn: () => Promise<void>;
  handlePauseCombat: () => Promise<void>;
  handleResumeCombat: () => Promise<void>;
  handleEndCombat: () => Promise<void>;
  handleEditInitiative: (_participantId: string, _newInitiative: number) => Promise<void>;
  handleDelayAction: (_participantId: string) => Promise<void>;
  handleReadyAction: (_participantId: string, _triggerCondition: string) => Promise<void>;
  handleExportInitiative: () => void;
  handleShareInitiative: () => void;
}

/**
 * Hook for managing initiative tracker state and actions
 *
 * Provides handlers for all initiative tracker operations including:
 * - Turn progression (next/previous)
 * - Combat state management (pause/resume/end)
 * - Initiative editing
 * - Export and sharing functionality
 */
export function useInitiativeTracker({
  encounter,
  onEncounterUpdate
}: UseInitiativeTrackerProps): UseInitiativeTrackerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeApiCall = useCallback(async (
    endpoint: string,
    method: string = 'PATCH',
    body?: any
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/encounters/${encounter._id}/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update encounter');
      }

      const data = await response.json();

      if (data.success && data.encounter) {
        onEncounterUpdate?.(data.encounter);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [encounter._id, onEncounterUpdate]);

  const handleNextTurn = useCallback(async () => {
    await makeApiCall('combat/next-turn');
  }, [makeApiCall]);

  const handlePreviousTurn = useCallback(async () => {
    await makeApiCall('combat/previous-turn');
  }, [makeApiCall]);

  const handlePauseCombat = useCallback(async () => {
    await makeApiCall('combat/pause');
  }, [makeApiCall]);

  const handleResumeCombat = useCallback(async () => {
    await makeApiCall('combat/resume');
  }, [makeApiCall]);

  const handleEndCombat = useCallback(async () => {
    await makeApiCall('combat/end');
  }, [makeApiCall]);

  const handleEditInitiative = useCallback(async (
    participantId: string,
    newInitiative: number
  ) => {
    await makeApiCall('combat/initiative', 'PATCH', {
      participantId,
      initiative: newInitiative
    });
  }, [makeApiCall]);

  const handleDelayAction = useCallback(async (participantId: string) => {
    await makeApiCall('combat/delay-action', 'PATCH', {
      participantId
    });
  }, [makeApiCall]);

  const handleReadyAction = useCallback(async (
    participantId: string,
    triggerCondition: string
  ) => {
    await makeApiCall('combat/ready-action', 'PATCH', {
      participantId,
      triggerCondition
    });
  }, [makeApiCall]);

  const handleExportInitiative = useCallback(() => {
    if (!encounter.combatState.isActive) {
      setError('Combat must be active to export initiative data');
      return;
    }

    try {
      const { buildExportData, createDownloadLink, generateExportFilename } = require('@/components/combat/useInitiativeHelpers');
      const exportData = buildExportData(encounter);
      const filename = generateExportFilename(encounter.name, encounter.combatState.currentRound);
      createDownloadLink(exportData, filename);
    } catch {
      setError('Failed to export initiative data');
    }
  }, [encounter]);

  const handleShareInitiative = useCallback(async () => {
    if (!encounter.combatState.isActive) {
      setError('Combat must be active to share initiative data');
      return;
    }

    try {
      const { buildShareText, copyToClipboard } = require('@/components/combat/useInitiativeHelpers');
      const shareText = buildShareText(encounter);

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Initiative Order - ${encounter.name}`,
            text: shareText,
          });
        } catch {
          // Fallback to clipboard
          await copyToClipboard(shareText);
        }
      } else {
        await copyToClipboard(shareText);
      }
    } catch {
      setError('Failed to share initiative data');
    }
  }, [encounter]);

  return {
    isLoading,
    error,
    handleNextTurn,
    handlePreviousTurn,
    handlePauseCombat,
    handleResumeCombat,
    handleEndCombat,
    handleEditInitiative,
    handleDelayAction,
    handleReadyAction,
    handleExportInitiative,
    handleShareInitiative
  };
}