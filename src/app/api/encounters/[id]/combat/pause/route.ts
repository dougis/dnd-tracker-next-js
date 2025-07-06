import { withCombatValidation } from '../api-wrapper';

export const PATCH = withCombatValidation(
  {
    operation: 'pausing combat',
    validateNotPaused: true
  },
  async (encounter) => {
    encounter.combatState.pausedAt = new Date();
    return true;
  }
);