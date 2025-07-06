'use client';

import { IEncounter } from '@/lib/models/encounter/interfaces';
import { findParticipantById } from './participantUtils';

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