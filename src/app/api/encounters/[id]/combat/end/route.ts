import { NextRequest } from 'next/server';
import { endCombat } from '@/lib/models/encounter/methods';
import {
  validateAndGetEncounter,
  validateCombatActive,
  createSuccessResponse,
  handleAsyncError
} from '../utils';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: encounterId } = await context.params;

    const { encounter, errorResponse } = await validateAndGetEncounter(encounterId);
    if (errorResponse) return errorResponse;

    const combatError = validateCombatActive(encounter!);
    if (combatError) return combatError;

    endCombat(encounter!);
    await encounter!.save();
    return createSuccessResponse(encounter!);

  } catch (error) {
    return handleAsyncError(error, 'ending combat');
  }
}