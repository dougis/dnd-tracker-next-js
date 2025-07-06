import { NextRequest } from 'next/server';
import { setInitiative } from '@/lib/models/encounter/methods';
import {
  validateAndGetEncounter,
  validateCombatActive,
  validateRequiredFields,
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

    const fieldsError = validateRequiredFields(body, ['participantId', 'initiative', 'dexterity']);
    if (fieldsError) return fieldsError;

    const { encounter, errorResponse } = await validateAndGetEncounter(encounterId);
    if (errorResponse) return errorResponse;

    const combatError = validateCombatActive(encounter!);
    if (combatError) return combatError;

    const success = setInitiative(encounter!, body.participantId, body.initiative, body.dexterity);
    if (!success) {
      return createErrorResponse('Participant not found', 400);
    }

    await encounter!.save();
    return createSuccessResponse(encounter!);

  } catch (error) {
    return handleAsyncError(error, 'updating initiative');
  }
}