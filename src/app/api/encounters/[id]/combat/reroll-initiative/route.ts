import { rerollInitiative } from '@/lib/models/encounter/initiative-rolling';
import { withCombatValidation } from '../api-wrapper';

export const POST = withCombatValidation(
  {
    operation: 'rerolling initiative',
    requireBody: false,
    requiredFields: [],
  },
  async (encounter, body) => {
    // Handle empty body case
    const bodyData = body || {};
    const { participantId } = bodyData;

    // Validate that we have an active initiative order
    if (!encounter.combatState.initiativeOrder || encounter.combatState.initiativeOrder.length === 0) {
      throw new Error('No initiative order found. Roll initiative first.');
    }

    // If participantId is provided, validate it exists
    if (participantId) {
      const existingEntry = encounter.combatState.initiativeOrder.find(
        entry => entry.participantId.toString() === participantId
      );

      if (!existingEntry) {
        throw new Error(`Participant with ID ${participantId} not found in initiative order`);
      }
    }

    // Store current active participant to maintain combat state
    const currentActiveIndex = encounter.combatState.initiativeOrder.findIndex(entry => entry.isActive);
    const currentActiveParticipantId = currentActiveIndex >= 0
      ? encounter.combatState.initiativeOrder[currentActiveIndex].participantId
      : null;

    // Reroll initiative
    encounter.combatState.initiativeOrder = rerollInitiative(
      encounter.combatState.initiativeOrder,
      participantId
    );

    // Restore active participant if combat is active
    if (encounter.combatState.isActive && currentActiveParticipantId) {
      const newActiveIndex = encounter.combatState.initiativeOrder.findIndex(
        entry => entry.participantId.toString() === currentActiveParticipantId.toString()
      );

      if (newActiveIndex >= 0) {
        // Reset all active states first
        encounter.combatState.initiativeOrder.forEach(entry => {
          entry.isActive = false;
        });

        // Set the previously active participant as active again
        encounter.combatState.initiativeOrder[newActiveIndex].isActive = true;
        encounter.combatState.currentTurn = newActiveIndex;
      }
    }

    // Return true to let the wrapper handle the success response and save
    return true;
  }
);