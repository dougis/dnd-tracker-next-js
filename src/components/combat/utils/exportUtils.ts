'use client';

import { IEncounter } from '@/lib/models/encounter/interfaces';
import { findParticipantById } from './participantUtils';

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
 * Helper function to generate filename for export
 */
export function generateExportFilename(encounterName: string, round: number): string {
  return `${encounterName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_initiative_round_${round}.json`;
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