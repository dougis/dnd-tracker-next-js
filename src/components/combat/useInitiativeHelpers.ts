'use client';

import { IEncounter, IParticipantReference } from '@/lib/models/encounter/interfaces';

/**
 * Helper function to find participant by character ID
 */
export function findParticipantById(
  participants: IParticipantReference[],
  participantId: string
): IParticipantReference | undefined {
  return participants.find(p =>
    p.characterId.toString() === participantId.toString()
  );
}

/**
 * Helper function to build export data
 */
export function buildExportData(encounter: IEncounter) {
  return {
    encounterName: encounter.name,
    round: encounter.combatState.currentRound,
    turn: encounter.combatState.currentTurn,
    initiativeOrder: encounter.combatState.initiativeOrder.map(entry => {
      const participant = findParticipantById(encounter.participants, entry.participantId.toString());
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
}

/**
 * Helper function to build share text
 */
export function buildShareText(encounter: IEncounter): string {
  const header = `Initiative Order - ${encounter.name} (Round ${encounter.combatState.currentRound})\n\n`;

  const orderLines = encounter.combatState.initiativeOrder.map((entry, index) => {
    const participant = findParticipantById(encounter.participants, entry.participantId.toString());
    const activeIndicator = index === encounter.combatState.currentTurn ? '→ ' : '   ';
    const actedIndicator = entry.hasActed ? ' ✓' : '';
    const hpInfo = participant ? `${participant.currentHitPoints}/${participant.maxHitPoints}` : 'Unknown';

    return `${activeIndicator}${entry.initiative}: ${participant?.name || 'Unknown'} (${hpInfo} HP)${actedIndicator}`;
  }).join('\n');

  return header + orderLines;
}

/**
 * Helper function to create download link
 */
export function createDownloadLink(data: object, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Helper function to copy text to clipboard with fallbacks
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Helper function to generate filename for export
 */
export function generateExportFilename(encounterName: string, round: number): string {
  return `${encounterName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_initiative_round_${round}.json`;
}

/**
 * Helper function to make API requests
 */
export async function makeRequest({
  url,
  method = 'PATCH',
  body,
  setIsLoading,
  setError,
  onEncounterUpdate
}: {
  url: string;
  method?: string;
  body?: any;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  onEncounterUpdate?: (encounter: any) => void;
}) {
  try {
    setIsLoading(true);
    setError(null);

    const response = await fetch(url, {
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
}