import { NextRequest } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { encounterSettingsPartialSchema } from '@/lib/validations/encounter';
import {
  createErrorResponse,
  createSuccessResponse,
  validateRouteId,
  handleZodValidationError
} from '@/lib/api/route-helpers';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Validate encounter ID using consolidated helper
    const encounterId = await validateRouteId(context.params, 'encounter');

    // Validate request body
    const body = await request.json();
    const validation = encounterSettingsPartialSchema.safeParse(body);

    if (!validation.success) {
      return handleZodValidationError(validation.error);
    }

    // Update encounter settings
    const result = await EncounterService.updateEncounter(encounterId, {
      settings: validation.data,
    });

    // Return result using consolidated helper
    if (!result.success) {
      return createErrorResponse(
        result.error?.message || 'Failed to update encounter settings',
        result.error?.statusCode || 500,
        result.error?.details
      );
    }

    return createSuccessResponse(
      { settings: result.data?.settings },
      'Encounter settings updated successfully'
    );
  } catch (error) {
    console.error('Error updating encounter settings:', error);
    return createErrorResponse('An unexpected error occurred', 500);
  }
}