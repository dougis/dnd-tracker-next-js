import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Effect } from './round-utils';

/**
 * Finds participant name by ID
 */
export function findParticipantName(
  encounter: IEncounter | null,
  participantId: string
): string {
  const participant = encounter?.participants?.find(
    p => p.characterId.toString() === participantId
  );
  return participant?.name || `Participant ${participantId}`;
}

/**
 * Calculates remaining duration and expiring status for an effect
 */
export function calculateEffectRemaining(
  effect: Effect,
  currentRound: number
): { remaining: number; isExpiring: boolean } {
  const remaining = Math.max(0, effect.duration - (currentRound - effect.startRound));
  const isExpiring = remaining === 1;
  return { remaining, isExpiring };
}

/**
 * Gets CSS class for effect display based on expiring status
 */
export function getEffectClassName(isExpiring: boolean): string {
  return `flex items-center justify-between p-2 rounded border ${
    isExpiring ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-border'
  }`;
}