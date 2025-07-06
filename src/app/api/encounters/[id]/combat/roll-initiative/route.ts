import { rollBulkInitiative, rollSingleInitiative } from '@/lib/models/encounter/initiative-rolling';
import { withCombatValidation } from '../api-wrapper';
import { Character } from '@/lib/models/Character';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

/**
 * Handles rolling initiative for a single participant
 */
async function rollSingleParticipantInitiative(
  encounter: IEncounter,
  participantId: string
): Promise<void> {
  // Find the participant to get their dexterity
  const participant = encounter.participants.find(
    p => p.characterId.toString() === participantId
  );

  if (!participant) {
    throw new Error(`Participant with ID ${participantId} not found`);
  }

  // Get the character document to access dexterity
  const character = await Character.findById(participant.characterId);
  if (!character) {
    throw new Error(`Character with ID ${participant.characterId} not found`);
  }

  // Update the initiative order with the new roll
  encounter.combatState.initiativeOrder = rollSingleInitiative(
    encounter.combatState.initiativeOrder,
    participantId,
    character.abilityScores.dexterity
  );
}

/**
 * Handles rolling initiative for all participants
 */
async function rollAllParticipantsInitiative(encounter: IEncounter): Promise<void> {
  // Get all character data to access dexterity scores
  const participantCharacters = await Character.find({
    _id: { $in: encounter.participants.map(p => p.characterId) }
  });

  // Map character data to participants
  const participantsWithDexterity = encounter.participants.map(participant => {
    const character = participantCharacters.find(
      c => c._id.toString() === participant.characterId.toString()
    );

    if (!character) {
      throw new Error(`Character with ID ${participant.characterId} not found`);
    }

    return {
      ...participant,
      abilityScores: character.abilityScores,
    };
  });

  // Roll initiative for all participants
  const initiativeEntries = rollBulkInitiative(participantsWithDexterity);

  // Convert back to IInitiativeEntry format (remove name and type)
  encounter.combatState.initiativeOrder = initiativeEntries.map(entry => ({
    participantId: entry.participantId,
    initiative: entry.initiative,
    dexterity: entry.dexterity,
    isActive: entry.isActive,
    hasActed: entry.hasActed,
    isDelayed: entry.isDelayed,
    readyAction: entry.readyAction,
  }));

  // Set first participant as active if combat is active
  if (encounter.combatState.isActive && encounter.combatState.initiativeOrder.length > 0) {
    encounter.combatState.initiativeOrder[0].isActive = true;
    encounter.combatState.currentTurn = 0;
  }
}

export const POST = withCombatValidation(
  {
    operation: 'rolling initiative',
    requireBody: false,
    requiredFields: [],
  },
  async (encounter, body) => {
    const bodyData = body || {};
    const { participantId, rollAll = false } = bodyData;

    // Choose initiative rolling strategy
    if (participantId && !rollAll) {
      await rollSingleParticipantInitiative(encounter, participantId);
    } else {
      await rollAllParticipantsInitiative(encounter);
    }

    return true;
  }
);