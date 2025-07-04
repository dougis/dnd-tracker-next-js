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
  _this: IEncounter,
  participant: Omit<IParticipantReference, 'characterId'> & {
    characterId: string;
  }
): void {
  _this.participants.push({
    ...participant,
    characterId: new Types.ObjectId(participant.characterId),
  });
}

export function removeParticipant(
  _this: IEncounter,
  participantId: string
): boolean {
  const index = _this.participants.findIndex(
    (p: IParticipantReference) => p.characterId.toString() === participantId
  );

  if (index === -1) return false;

  _this.participants.splice(index, 1);

  // Remove from initiative order if present
  const initIndex = _this.combatState.initiativeOrder.findIndex(
    (entry: IInitiativeEntry) =>
      entry.participantId.toString() === participantId
  );

  if (initIndex !== -1) {
    _this.combatState.initiativeOrder.splice(initIndex, 1);

    // Adjust current turn if necessary
    if (
      _this.combatState.currentTurn >= initIndex &&
      _this.combatState.currentTurn > 0
    ) {
      _this.combatState.currentTurn--;
    }
  }

  return true;
}

export function updateParticipant(
  _this: IEncounter,
  participantId: string,
  updates: Partial<IParticipantReference>
): boolean {
  const participant = findParticipantById(_this.participants, participantId);
  if (!participant) return false;

  Object.assign(participant, updates);
  return true;
}

export function getParticipant(
  _this: IEncounter,
  participantId: string
): IParticipantReference | null {
  return findParticipantById(_this.participants, participantId);
}

/**
 * Combat management methods
 */

export function startCombat(
  _this: IEncounter,
  autoRollInitiative = false
): void {
  _this.combatState.isActive = true;
  _this.combatState.currentRound = 1;
  _this.combatState.currentTurn = 0;
  _this.combatState.startedAt = new Date();
  _this.combatState.pausedAt = undefined;
  _this.combatState.endedAt = undefined;
  _this.status = 'active';

  // Initialize initiative order
  _this.combatState.initiativeOrder = _this.participants.map(
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
  _this.combatState.initiativeOrder = sortInitiativeOrder(
    _this.combatState.initiativeOrder
  );

  // Set first participant as active
  if (_this.combatState.initiativeOrder.length > 0) {
    _this.combatState.initiativeOrder[0].isActive = true;
  }
}

export function endCombat(_this: IEncounter): void {
  _this.combatState.isActive = false;
  _this.combatState.endedAt = new Date();
  _this.status = 'completed';

  // Calculate total duration
  if (_this.combatState.startedAt) {
    _this.combatState.totalDuration = calculateCombatDuration(
      _this.combatState.startedAt,
      _this.combatState.endedAt,
      _this.combatState.pausedAt
    );
  }

  // Reset all active states
  _this.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
    entry.isActive = false;
    entry.hasActed = false;
  });
}

export function nextTurn(_this: IEncounter): boolean {
  if (
    !_this.combatState.isActive ||
    _this.combatState.initiativeOrder.length === 0
  ) {
    return false;
  }

  // Mark current participant as having acted
  const currentEntry =
    _this.combatState.initiativeOrder[_this.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.hasActed = true;
    currentEntry.isActive = false;
  }

  // Move to next turn
  _this.combatState.currentTurn++;

  // Check if we need to start a new round
  if (_this.combatState.currentTurn >= _this.combatState.initiativeOrder.length) {
    _this.combatState.currentTurn = 0;
    _this.combatState.currentRound++;

    // Reset hasActed for new round
    _this.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
      entry.hasActed = false;
    });
  }

  // Set next participant as active
  const nextEntry =
    _this.combatState.initiativeOrder[_this.combatState.currentTurn];
  if (nextEntry) {
    nextEntry.isActive = true;
  }

  return true;
}

export function previousTurn(_this: IEncounter): boolean {
  if (
    !_this.combatState.isActive ||
    _this.combatState.initiativeOrder.length === 0
  ) {
    return false;
  }

  // Mark current participant as inactive
  const currentEntry =
    _this.combatState.initiativeOrder[_this.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.isActive = false;
  }

  // Move to previous turn
  _this.combatState.currentTurn--;

  // Check if we need to go to previous round
  if (_this.combatState.currentTurn < 0) {
    _this.combatState.currentTurn = _this.combatState.initiativeOrder.length - 1;
    _this.combatState.currentRound = Math.max(
      1,
      _this.combatState.currentRound - 1
    );
  }

  // Set previous participant as active
  const prevEntry =
    _this.combatState.initiativeOrder[_this.combatState.currentTurn];
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
  _this: IEncounter,
  participantId: string,
  initiative: number,
  dexterity: number
): boolean {
  const entry = findInitiativeEntryById(
    _this.combatState.initiativeOrder,
    participantId
  );
  if (!entry) return false;

  entry.initiative = initiative;
  entry.dexterity = dexterity;

  // Re-sort initiative order
  _this.combatState.initiativeOrder = sortInitiativeOrder(
    _this.combatState.initiativeOrder
  );

  // Update current turn index
  const activeEntry = _this.combatState.initiativeOrder.find(
    (e: IInitiativeEntry) => e.isActive
  );
  if (activeEntry) {
    _this.combatState.currentTurn = _this.combatState.initiativeOrder.findIndex(
      (e: IInitiativeEntry) =>
        e.participantId.toString() === activeEntry.participantId.toString()
    );
  }

  return true;
}

export function applyDamage(
  _this: IEncounter,
  participantId: string,
  damage: number
): boolean {
  const participant = getParticipant(_this, participantId);
  if (!participant) return false;

  return applyDamageToParticipant(participant, damage);
}

export function applyHealing(
  _this: IEncounter,
  participantId: string,
  healing: number
): boolean {
  const participant = getParticipant(_this, participantId);
  if (!participant) return false;

  return healParticipant(participant, healing);
}

export function addCondition(
  _this: IEncounter,
  participantId: string,
  condition: string
): boolean {
  const participant = getParticipant(_this, participantId);
  if (!participant) return false;

  return addConditionToParticipant(participant, condition);
}

export function removeCondition(
  _this: IEncounter,
  participantId: string,
  condition: string
): boolean {
  const participant = getParticipant(_this, participantId);
  if (!participant) return false;

  return removeConditionFromParticipant(participant, condition);
}

/**
 * Utility methods
 */
export function getInitiativeOrder(_this: IEncounter): IInitiativeEntry[] {
  return [..._this.combatState.initiativeOrder];
}

export function calculateDifficulty(
  _this: IEncounter
): z.infer<typeof encounterDifficultySchema> {
  return calculateEncounterDifficulty(
    _this.playerCount,
    _this.participants.length
  );
}

export function duplicateEncounter(
  _this: IEncounter,
  newName?: string
): IEncounter {
  const duplicateData = _this.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  duplicateData.name = newName || `${_this.name} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.combatState = {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  };
  duplicateData.version = 1;

  return new (_this.constructor as EncounterModel)(duplicateData);
}

export function toSummary(_this: IEncounter): EncounterSummary {
  return {
    _id: _this._id,
    name: _this.name,
    description: _this.description,
    tags: _this.tags,
    difficulty: _this.difficulty,
    estimatedDuration: _this.estimatedDuration,
    targetLevel: _this.targetLevel,
    status: _this.status,
    isPublic: _this.isPublic,
    participantCount: _this.participantCount,
    playerCount: _this.playerCount,
    isActive: _this.isActive,
    createdAt: _this.createdAt,
    updatedAt: _this.updatedAt,
  };
}
