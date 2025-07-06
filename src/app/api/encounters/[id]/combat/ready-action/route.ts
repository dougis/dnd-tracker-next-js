import { withCombatValidation } from '../api-wrapper';

export const PATCH = withCombatValidation(
  {
    operation: 'setting ready action',
    requiredFields: ['participantId', 'readyAction'],
    findParticipant: true
  },
  async (encounter, body, participant) => {
    participant.readyAction = body.readyAction;
    return true;
  }
);