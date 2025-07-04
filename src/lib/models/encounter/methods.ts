/* eslint-disable no-unused-vars */
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
  this: IEncounter,
  participant: Omit<IParticipantReference, 'characterId'> & {
    characterId: string;
  }
): void {
  this.participants.push({
    ...participant,
    characterId: new Types.ObjectId(participant.characterId),
  });
}

export function removeParticipant(
  this: IEncounter,
  participantId: string
): boolean {
  const index = this.participants.findIndex(
    (p: IParticipantReference) => p.characterId.toString() === participantId
  );

  if (index === -1) return false;

  this.participants.splice(index, 1);

  // Remove from initiative order if present
  const initIndex = this.combatState.initiativeOrder.findIndex(
    (entry: IInitiativeEntry) =>
      entry.participantId.toString() === participantId
  );

  if (initIndex !== -1) {
    this.combatState.initiativeOrder.splice(initIndex, 1);

    // Adjust current turn if necessary
    if (
      this.combatState.currentTurn >= initIndex &&
      this.combatState.currentTurn > 0
    ) {
      this.combatState.currentTurn--;
    }
  }

  return true;
}

export function updateParticipant(
  this: IEncounter,
  participantId: string,
  updates: Partial<IParticipantReference>
): boolean {
  const participant = findParticipantById(this.participants, participantId);
  if (!participant) return false;

  Object.assign(participant, updates);
  return true;
}

export function getParticipant(
  this: IEncounter,
  participantId: string
): IParticipantReference | null {
  return findParticipantById(this.participants, participantId);
}

/**
 * Combat management methods
 */

export function startCombat(
  this: IEncounter,
  autoRollInitiative = false
): void {
  this.combatState.isActive = true;
  this.combatState.currentRound = 1;
  this.combatState.currentTurn = 0;
  this.combatState.startedAt = new Date();
  this.combatState.pausedAt = undefined;
  this.combatState.endedAt = undefined;
  this.status = 'active';

  // Initialize initiative order
  this.combatState.initiativeOrder = this.participants.map(
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
  this.combatState.initiativeOrder = sortInitiativeOrder(
    this.combatState.initiativeOrder
  );

  // Set first participant as active
  if (this.combatState.initiativeOrder.length > 0) {
    this.combatState.initiativeOrder[0].isActive = true;
  }
}

export function endCombat(this: IEncounter): void {
  this.combatState.isActive = false;
  this.combatState.endedAt = new Date();
  this.status = 'completed';

  // Calculate total duration
  if (this.combatState.startedAt) {
    this.combatState.totalDuration = calculateCombatDuration(
      this.combatState.startedAt,
      this.combatState.endedAt,
      this.combatState.pausedAt
    );
  }

  // Reset all active states
  this.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
    entry.isActive = false;
    entry.hasActed = false;
  });
}

export function nextTurn(this: IEncounter): boolean {
  if (
    !this.combatState.isActive ||
    this.combatState.initiativeOrder.length === 0
  ) {
    return false;
  }

  // Mark current participant as having acted
  const currentEntry =
    this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.hasActed = true;
    currentEntry.isActive = false;
  }

  // Move to next turn
  this.combatState.currentTurn++;

  // Check if we need to start a new round
  if (this.combatState.currentTurn >= this.combatState.initiativeOrder.length) {
    this.combatState.currentTurn = 0;
    this.combatState.currentRound++;

    // Reset hasActed for new round
    this.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
      entry.hasActed = false;
    });
  }

  // Set next participant as active
  const nextEntry =
    this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (nextEntry) {
    nextEntry.isActive = true;
  }

  return true;
}

export function previousTurn(this: IEncounter): boolean {
  if (
    !this.combatState.isActive ||
    this.combatState.initiativeOrder.length === 0
  ) {
    return false;
  }

  // Mark current participant as inactive
  const currentEntry =
    this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.isActive = false;
  }

  // Move to previous turn
  this.combatState.currentTurn--;

  // Check if we need to go to previous round
  if (this.combatState.currentTurn < 0) {
    this.combatState.currentTurn = this.combatState.initiativeOrder.length - 1;
    this.combatState.currentRound = Math.max(
      1,
      this.combatState.currentRound - 1
    );
  }

  // Set previous participant as active
  const prevEntry =
    this.combatState.initiativeOrder[this.combatState.currentTurn];
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
  this: IEncounter,
  participantId: string,
  initiative: number,
  dexterity: number
): boolean {
  const entry = findInitiativeEntryById(
    this.combatState.initiativeOrder,
    participantId
  );
  if (!entry) return false;

  entry.initiative = initiative;
  entry.dexterity = dexterity;

  // Re-sort initiative order
  this.combatState.initiativeOrder = sortInitiativeOrder(
    this.combatState.initiativeOrder
  );

  // Update current turn index
  const activeEntry = this.combatState.initiativeOrder.find(
    (e: IInitiativeEntry) => e.isActive
  );
  if (activeEntry) {
    this.combatState.currentTurn = this.combatState.initiativeOrder.findIndex(
      (e: IInitiativeEntry) =>
        e.participantId.toString() === activeEntry.participantId.toString()
    );
  }

  return true;
}

export function applyDamage(
  this: IEncounter,
  participantId: string,
  damage: number
): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant) return false;

  return applyDamageToParticipant(participant, damage);
}

export function applyHealing(
  this: IEncounter,
  participantId: string,
  healing: number
): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant) return false;

  return healParticipant(participant, healing);
}

export function addCondition(
  this: IEncounter,
  participantId: string,
  condition: string
): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant) return false;

  return addConditionToParticipant(participant, condition);
}

export function removeCondition(
  this: IEncounter,
  participantId: string,
  condition: string
): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant) return false;

  return removeConditionFromParticipant(participant, condition);
}

/**
 * Utility methods
 */

export function getInitiativeOrder(this: IEncounter): IInitiativeEntry[] {
  return [...this.combatState.initiativeOrder];
}

export function calculateDifficulty(
  this: IEncounter
): z.infer<typeof encounterDifficultySchema> {
  return calculateEncounterDifficulty(
    this.playerCount,
    this.participants.length
  );
}

export function duplicateEncounter(
  this: IEncounter,
  newName?: string
): IEncounter {
  const duplicateData = this.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  duplicateData.name = newName || `${this.name} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.combatState = {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  };
  duplicateData.version = 1;

  return new (this.constructor as EncounterModel)(duplicateData);
}

export function toSummary(this: IEncounter): EncounterSummary {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    tags: this.tags,
    difficulty: this.difficulty,
    estimatedDuration: this.estimatedDuration,
    targetLevel: this.targetLevel,
    status: this.status,
    isPublic: this.isPublic,
    participantCount: this.participantCount,
    playerCount: this.playerCount,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
}
