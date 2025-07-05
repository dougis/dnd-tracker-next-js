
import { Types } from 'mongoose';
import { z } from 'zod';
import { encounterDifficultySchema } from '../../validations/encounter';
import {
  IEncounter,
  IParticipantReference,
  IInitiativeEntry,
  EncounterSummary,
  EncounterModel,
} from './interfaces';
import {
  sortInitiativeOrder,
  rollInitiative,
  calculateEncounterDifficulty,
  findParticipantById,
  findInitiativeEntryById,
  applyDamageToParticipant,
  healParticipant,
  addConditionToParticipant,
  removeConditionFromParticipant,
  calculateCombatDuration,
} from './utils';

/**
 * Participant management methods
 */
export function addParticipant(
  encounter: IEncounter,
  participant: Omit<IParticipantReference, 'characterId'> & {
    characterId: string;
  }
): void {
  encounter.participants.push({
    ...participant,
    characterId: new Types.ObjectId(participant.characterId),
  });
}

export function removeParticipant(
  encounter: IEncounter,
  participantId: string
): boolean {
  const index = encounter.participants.findIndex(
    (p: IParticipantReference) => p.characterId.toString() === participantId
  );

  if (index === -1) return false;

  encounter.participants.splice(index, 1);

  // Remove from initiative order if present
  const initIndex = encounter.combatState.initiativeOrder.findIndex(
    (entry: IInitiativeEntry) =>
      entry.participantId.toString() === participantId
  );

  if (initIndex !== -1) {
    encounter.combatState.initiativeOrder.splice(initIndex, 1);

    // Adjust current turn if necessary
    if (
      encounter.combatState.currentTurn >= initIndex &&
      encounter.combatState.currentTurn > 0
    ) {
      encounter.combatState.currentTurn--;
    }
  }

  return true;
}

export function updateParticipant(
  encounter: IEncounter,
  participantId: string,
  updates: Partial<IParticipantReference>
): boolean {
  const participant = findParticipantById(encounter.participants, participantId);
  if (!participant) return false;

  Object.assign(participant, updates);
  return true;
}

export function getParticipant(
  encounter: IEncounter,
  participantId: string
): IParticipantReference | null {
  return findParticipantById(encounter.participants, participantId);
}

/**
 * Combat management methods
 */

export function startCombat(
  encounter: IEncounter,
  autoRollInitiative = false
): void {
  encounter.combatState.isActive = true;
  encounter.combatState.currentRound = 1;
  encounter.combatState.currentTurn = 0;
  encounter.combatState.startedAt = new Date();
  encounter.combatState.pausedAt = undefined;
  encounter.combatState.endedAt = undefined;
  encounter.status = 'active';

  // Initialize initiative order
  encounter.combatState.initiativeOrder = encounter.participants.map(
    (participant: IParticipantReference) => ({
      participantId: participant.characterId,
      initiative: autoRollInitiative
        ? rollInitiative()
        : participant.initiative || 0,
      dexterity: 10, // Default dexterity, should be updated with actual character data
      isActive: false,
      hasActed: false,
    })
  );

  // Sort initiative order
  encounter.combatState.initiativeOrder = sortInitiativeOrder(
    encounter.combatState.initiativeOrder
  );

  // Set first participant as active
  if (encounter.combatState.initiativeOrder.length > 0) {
    encounter.combatState.initiativeOrder[0].isActive = true;
  }
}

export function endCombat(encounter: IEncounter): void {
  encounter.combatState.isActive = false;
  encounter.combatState.endedAt = new Date();
  encounter.status = 'completed';

  // Calculate total duration
  if (encounter.combatState.startedAt) {
    encounter.combatState.totalDuration = calculateCombatDuration(
      encounter.combatState.startedAt,
      encounter.combatState.endedAt,
      encounter.combatState.pausedAt
    );
  }

  // Reset all active states
  encounter.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
    entry.isActive = false;
    entry.hasActed = false;
  });
}

export function nextTurn(encounter: IEncounter): boolean {
  if (
    !encounter.combatState.isActive ||
    encounter.combatState.initiativeOrder.length === 0
  ) {
    return false;
  }

  // Mark current participant as having acted
  const currentEntry =
    encounter.combatState.initiativeOrder[encounter.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.hasActed = true;
    currentEntry.isActive = false;
  }

  // Move to next turn
  encounter.combatState.currentTurn++;

  // Check if we need to start a new round
  if (encounter.combatState.currentTurn >= encounter.combatState.initiativeOrder.length) {
    encounter.combatState.currentTurn = 0;
    encounter.combatState.currentRound++;

    // Reset hasActed for new round
    encounter.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
      entry.hasActed = false;
    });
  }

  // Set next participant as active
  const nextEntry =
    encounter.combatState.initiativeOrder[encounter.combatState.currentTurn];
  if (nextEntry) {
    nextEntry.isActive = true;
  }

  return true;
}

export function previousTurn(encounter: IEncounter): boolean {
  if (
    !encounter.combatState.isActive ||
    encounter.combatState.initiativeOrder.length === 0
  ) {
    return false;
  }

  // Mark current participant as inactive
  const currentEntry =
    encounter.combatState.initiativeOrder[encounter.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.isActive = false;
  }

  // Move to previous turn
  encounter.combatState.currentTurn--;

  // Check if we need to go to previous round
  if (encounter.combatState.currentTurn < 0) {
    encounter.combatState.currentTurn = encounter.combatState.initiativeOrder.length - 1;
    encounter.combatState.currentRound = Math.max(
      1,
      encounter.combatState.currentRound - 1
    );
  }

  // Set previous participant as active
  const prevEntry =
    encounter.combatState.initiativeOrder[encounter.combatState.currentTurn];
  if (prevEntry) {
    prevEntry.isActive = true;
    prevEntry.hasActed = false;
  }

  return true;
}

/**
 * Initiative and combat action methods
 */
export function setInitiative(
  encounter: IEncounter,
  participantId: string,
  initiative: number,
  dexterity: number
): boolean {
  const entry = findInitiativeEntryById(
    encounter.combatState.initiativeOrder,
    participantId
  );
  if (!entry) return false;

  entry.initiative = initiative;
  entry.dexterity = dexterity;

  // Re-sort initiative order
  encounter.combatState.initiativeOrder = sortInitiativeOrder(
    encounter.combatState.initiativeOrder
  );

  // Update current turn index
  const activeEntry = encounter.combatState.initiativeOrder.find(
    (e: IInitiativeEntry) => e.isActive
  );
  if (activeEntry) {
    encounter.combatState.currentTurn = encounter.combatState.initiativeOrder.findIndex(
      (e: IInitiativeEntry) =>
        e.participantId.toString() === activeEntry.participantId.toString()
    );
  }

  return true;
}

export function applyDamage(
  encounter: IEncounter,
  participantId: string,
  damage: number
): boolean {
  const participant = getParticipant(encounter, participantId);
  if (!participant) return false;

  return applyDamageToParticipant(participant, damage);
}

export function applyHealing(
  encounter: IEncounter,
  participantId: string,
  healing: number
): boolean {
  const participant = getParticipant(encounter, participantId);
  if (!participant) return false;

  return healParticipant(participant, healing);
}

export function addCondition(
  encounter: IEncounter,
  participantId: string,
  condition: string
): boolean {
  const participant = getParticipant(encounter, participantId);
  if (!participant) return false;

  return addConditionToParticipant(participant, condition);
}

export function removeCondition(
  encounter: IEncounter,
  participantId: string,
  condition: string
): boolean {
  const participant = getParticipant(encounter, participantId);
  if (!participant) return false;

  return removeConditionFromParticipant(participant, condition);
}

/**
 * Utility methods
 */

export function getInitiativeOrder(encounter: IEncounter): IInitiativeEntry[] {
  return [...encounter.combatState.initiativeOrder];
}

export function calculateDifficulty(
  encounter: IEncounter
): z.infer<typeof encounterDifficultySchema> {
  return calculateEncounterDifficulty(
    encounter.playerCount,
    encounter.participants.length
  );
}

export function duplicateEncounter(
  encounter: IEncounter,
  newName?: string
): IEncounter {
  const duplicateData = encounter.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  duplicateData.name = newName || `${encounter.name} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.combatState = {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  };
  duplicateData.version = 1;

  return new (encounter.constructor as EncounterModel)(duplicateData);
}

export function toSummary(encounter: IEncounter): EncounterSummary {
  return {
    _id: encounter._id,
    name: encounter.name,
    description: encounter.description,
    tags: encounter.tags,
    difficulty: encounter.difficulty,
    estimatedDuration: encounter.estimatedDuration,
    targetLevel: encounter.targetLevel,
    status: encounter.status,
    isPublic: encounter.isPublic,
    participantCount: encounter.participantCount,
    playerCount: encounter.playerCount,
    isActive: encounter.isActive,
    createdAt: encounter.createdAt,
    updatedAt: encounter.updatedAt,
  };
}
