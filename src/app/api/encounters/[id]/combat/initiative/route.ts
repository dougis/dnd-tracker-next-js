import { setInitiative } from '@/lib/models/encounter/methods';
import { withCombatValidation } from '../api-wrapper';

export const PATCH = withCombatValidation(
  {
    operation: 'updating initiative',
    requiredFields: ['participantId', 'initiative', 'dexterity']
  },
  async (encounter, body) => {
    return setInitiative(encounter, body.participantId, body.initiative, body.dexterity);
  }
);