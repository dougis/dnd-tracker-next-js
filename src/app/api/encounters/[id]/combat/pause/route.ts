import { NextRequest } from 'next/server';
import {
  validateAndGetEncounter,
  validateCombatActive,
  createSuccessResponse,
  createErrorResponse,
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

    if (encounter!.combatState.pausedAt) {
      return createErrorResponse('Combat is already paused', 400);
    }

    encounter!.combatState.pausedAt = new Date();
    await encounter!.save();
    return createSuccessResponse(encounter!);

  } catch (error) {
    return handleAsyncError(error, 'pausing combat');
  }
}