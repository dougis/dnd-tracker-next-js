import { NextRequest } from 'next/server';
import { nextTurn } from '@/lib/models/encounter/methods';
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
      return createErrorResponse('Combat is paused', 400);
    }

    const success = nextTurn(encounter!);
    if (!success) {
      return createErrorResponse('Unable to advance turn', 400);
    }

    await encounter!.save();
    return createSuccessResponse(encounter!);

  } catch (error) {
    return handleAsyncError(error, 'advancing turn');
  }
}