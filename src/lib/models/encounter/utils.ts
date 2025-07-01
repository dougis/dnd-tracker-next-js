// Types import removed as it's not used in this file
import { z } from 'zod';
import { encounterDifficultySchema } from '../../validations/encounter';
import { IInitiativeEntry, IParticipantReference } from './interfaces';

/**
 * Utility functions for encounter operations
 */

/**
 * Sorts initiative order by initiative value, then by dexterity
 */
export function sortInitiativeOrder(entries: IInitiativeEntry[]): IInitiativeEntry[] {
  return entries.sort((a: IInitiativeEntry, b: IInitiativeEntry) => {
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative;
    }
    return b.dexterity - a.dexterity;
  });
}

/**
 * Generates random initiative roll (1d20)
 */
export function rollInitiative(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Calculates encounter difficulty based on participant ratio
 */
export function calculateEncounterDifficulty(
  playerCount: number,
  totalParticipants: number
): z.infer<typeof encounterDifficultySchema> {
  const nonPlayerCount = totalParticipants - playerCount;
  const ratio = nonPlayerCount / Math.max(playerCount, 1);

  if (ratio <= 0.5) return 'trivial';
  if (ratio <= 1) return 'easy';
  if (ratio <= 1.5) return 'medium';
  if (ratio <= 2) return 'hard';
  return 'deadly';
}

/**
 * Finds participant by character ID
 */
export function findParticipantById(
  participants: IParticipantReference[],
  participantId: string
): IParticipantReference | null {
  return participants.find((p: IParticipantReference) =>
    p.characterId.toString() === participantId
  ) || null;
}

/**
 * Finds initiative entry by participant ID
 */
export function findInitiativeEntryById(
  initiativeOrder: IInitiativeEntry[],
  participantId: string
): IInitiativeEntry | null {
  return initiativeOrder.find((entry: IInitiativeEntry) =>
    entry.participantId.toString() === participantId
  ) || null;
}

/**
 * Applies damage to a participant, handling temporary HP
 */
export function applyDamageToParticipant(
  participant: IParticipantReference,
  damage: number
): boolean {
  if (damage < 0) return false;

  // Apply damage to temporary HP first
  if (participant.temporaryHitPoints > 0) {
    const tempDamage = Math.min(damage, participant.temporaryHitPoints);
    participant.temporaryHitPoints -= tempDamage;
    damage -= tempDamage;
  }

  // Apply remaining damage to current HP
  if (damage > 0) {
    participant.currentHitPoints = Math.max(0, participant.currentHitPoints - damage);
  }

  return true;
}

/**
 * Applies healing to a participant
 */
export function healParticipant(
  participant: IParticipantReference,
  healing: number
): boolean {
  if (healing < 0) return false;

  participant.currentHitPoints = Math.min(
    participant.maxHitPoints,
    participant.currentHitPoints + healing
  );

  return true;
}

/**
 * Adds a condition if not already present
 */
export function addConditionToParticipant(
  participant: IParticipantReference,
  condition: string
): boolean {
  if (!participant.conditions.includes(condition)) {
    participant.conditions.push(condition);
    return true;
  }
  return false;
}

/**
 * Removes a condition if present
 */
export function removeConditionFromParticipant(
  participant: IParticipantReference,
  condition: string
): boolean {
  const index = participant.conditions.indexOf(condition);
  if (index !== -1) {
    participant.conditions.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Calculates combat duration considering pauses
 */
export function calculateCombatDuration(
  startTime: Date,
  endTime: Date,
  pauseTime?: Date
): number {
  const endTimestamp = endTime.getTime();
  const startTimestamp = startTime.getTime();
  const pauseDuration = pauseTime ? (pauseTime.getTime() - startTimestamp) : 0;

  return Math.max(0, endTimestamp - startTimestamp - pauseDuration);
}

/**
 * Creates default encounter settings
 */
export function createDefaultEncounterSettings() {
  return {
    allowPlayerVisibility: true,
    autoRollInitiative: false,
    trackResources: true,
    enableLairActions: false,
    enableGridMovement: false,
    gridSize: 5,
  };
}

/**
 * Creates default combat state
 */
export function createDefaultCombatState() {
  return {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  };
}

/**
 * Validates participant HP bounds
 */
export function validateParticipantHP(participant: IParticipantReference): void {
  if (participant.currentHitPoints > participant.maxHitPoints) {
    participant.currentHitPoints = participant.maxHitPoints;
  }
  if (participant.temporaryHitPoints < 0) {
    participant.temporaryHitPoints = 0;
  }
}