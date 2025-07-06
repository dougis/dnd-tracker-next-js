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
      const initiativeData = {
        encounterName: encounter.name,
        round: encounter.combatState.currentRound,
        turn: encounter.combatState.currentTurn,
        initiativeOrder: encounter.combatState.initiativeOrder.map(entry => {
          const participant = encounter.participants.find(p =>
            p.characterId.toString() === entry.participantId.toString()
          );
          return {
            name: participant?.name || 'Unknown',
            initiative: entry.initiative,
            dexterity: entry.dexterity,
            hasActed: entry.hasActed,
            hitPoints: participant ? `${participant.currentHitPoints}/${participant.maxHitPoints}` : 'Unknown',
            armorClass: participant?.armorClass || 'Unknown',
            conditions: participant?.conditions || []
          };
        }),
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(initiativeData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${encounter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_initiative_round_${encounter.combatState.currentRound}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export initiative data');
    }
  }, [encounter]);

  const handleShareInitiative = useCallback(() => {
    if (!encounter.combatState.isActive) {
      setError('Combat must be active to share initiative data');
      return;
    }

    try {
      const shareText = `Initiative Order - ${encounter.name} (Round ${encounter.combatState.currentRound})\n\n` +
        encounter.combatState.initiativeOrder.map((entry, index) => {
          const participant = encounter.participants.find(p =>
            p.characterId.toString() === entry.participantId.toString()
          );
          const activeIndicator = index === encounter.combatState.currentTurn ? '→ ' : '   ';
          const actedIndicator = entry.hasActed ? ' ✓' : '';
          return `${activeIndicator}${entry.initiative}: ${participant?.name || 'Unknown'} (${participant?.currentHitPoints}/${participant?.maxHitPoints} HP)${actedIndicator}`;
        }).join('\n');

      if (navigator.share) {
        navigator.share({
          title: `Initiative Order - ${encounter.name}`,
          text: shareText,
        }).catch(() => {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareText);
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
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