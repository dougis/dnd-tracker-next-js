import { NextRequest } from 'next/server';
import { previousTurn } from '@/lib/models/encounter/methods';
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

    if (encounter!.combatState.currentTurn === 0 && encounter!.combatState.currentRound === 1) {
      return createErrorResponse('No previous turn available', 400);
    }

    const success = previousTurn(encounter!);
    if (!success) {
      return createErrorResponse('Unable to go to previous turn', 400);
    }

    await encounter!.save();
    return createSuccessResponse(encounter!);

  } catch (error) {
    return handleAsyncError(error, 'going to previous turn');
  }
}