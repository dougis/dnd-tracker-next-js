'use client';

import { IEncounter, IInitiativeEntry, IParticipantReference } from '@/lib/models/encounter/interfaces';
import { findParticipantById } from './participantUtils';

/**
 * Formats an individual initiative entry line
 */
function formatInitiativeEntry(
  entry: IInitiativeEntry,
  index: number,
  participant: IParticipantReference | undefined,
  currentTurn: number
): string {
  const activeIndicator = index === currentTurn ? '→ ' : '   ';
  const actedIndicator = entry.hasActed ? ' ✓' : '';
  const hpInfo = participant ? `${participant.currentHitPoints}/${participant.maxHitPoints}` : 'Unknown';
  const participantName = participant?.name || 'Unknown';

  return `${activeIndicator}${entry.initiative}: ${participantName} (${hpInfo} HP)${actedIndicator}`;
}

/**
 * Helper function to build share text
 */
export function buildShareText(encounter: IEncounter): string {
  const header = `Initiative Order - ${encounter.name} (Round ${encounter.combatState.currentRound})\n\n`;

  const orderLines = encounter.combatState.initiativeOrder.map((entry, index) => {
    const participant = findParticipantById(encounter.participants, entry.participantId.toString());
    return formatInitiativeEntry(entry, index, participant, encounter.combatState.currentTurn);
  }).join('\n');

  return header + orderLines;
}

/**
 * Creates temporary textarea for clipboard fallback
 */
function createClipboardFallback(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

/**
 * Helper function to copy text to clipboard with fallbacks
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    createClipboardFallback(text);
  }
}