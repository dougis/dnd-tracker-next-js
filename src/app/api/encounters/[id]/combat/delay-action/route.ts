import { NextRequest } from 'next/server';
import {
  validateAndGetEncounter,
  validateCombatActive,
  validateRequiredFields,
  findParticipantInInitiative,
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
    const body = await request.json();

    const fieldsError = validateRequiredFields(body, ['participantId']);
    if (fieldsError) return fieldsError;

    const { encounter, errorResponse } = await validateAndGetEncounter(encounterId);
    if (errorResponse) return errorResponse;

    const combatError = validateCombatActive(encounter!);
    if (combatError) return combatError;

    const initiativeEntry = findParticipantInInitiative(encounter!, body.participantId);
    if (!initiativeEntry) {
      return createErrorResponse('Participant not found', 400);
    }

    initiativeEntry.isDelayed = true;
    await encounter!.save();
    return createSuccessResponse(encounter!);

  } catch (error) {
    return handleAsyncError(error, 'delaying action');
  }
}