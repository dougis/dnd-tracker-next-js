import { NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { IEncounter } from '@/lib/models/encounter/interfaces';

/**
 * Validates and retrieves an encounter by ID
 * @param encounterId - The encounter ID to validate
 * @returns Promise<{ encounter: IEncounter | null; errorResponse: NextResponse | null }>
 */
export async function validateAndGetEncounter(encounterId: string): Promise<{
  encounter: IEncounter | null;
  errorResponse: NextResponse | null;
}> {
  try {
    const encounterResult = await EncounterService.getEncounterById(encounterId);

    if (!encounterResult.success) {
      return {
        encounter: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Encounter not found' },
          { status: 404 }
        )
      };
    }

    const encounter = encounterResult.data;
    if (!encounter) {
      return {
        encounter: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Encounter not found' },
          { status: 404 }
        )
      };
    }

    return { encounter, errorResponse: null };
  } catch (_error) {
    console.error('Error validating and getting encounter:', _error);
    return {
      encounter: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      )
    };
  }
}

/**
 * Validates that combat is active for an encounter
 * @param encounter - The encounter to validate
 * @returns NextResponse | null - Error response if invalid, null if valid
 */
export function validateCombatActive(encounter: IEncounter): NextResponse | null {
  if (!encounter.combatState?.isActive) {
    return NextResponse.json(
      { success: false, message: 'Combat is not active' },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Validates required fields from request body
 * @param body - The request body
 * @param requiredFields - Array of required field names
 * @returns NextResponse | null - Error response if invalid, null if valid
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): NextResponse | null {
  const missingFields = requiredFields.filter(field => {
    const value = body[field];
    return value === undefined || value === null;
  });

  if (missingFields.length > 0) {
    return NextResponse.json(
      { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Finds a participant in the initiative order
 * @param encounter - The encounter to search
 * @param participantId - The participant ID to find
 * @returns The initiative entry or null if not found
 */
export function findParticipantInInitiative(encounter: IEncounter, participantId: string) {
  return encounter.combatState.initiativeOrder.find(
    entry => entry.participantId.toString() === participantId
  );
}

/**
 * Creates a standard success response
 * @param encounter - The encounter to return
 * @returns NextResponse with success format
 */
export function createSuccessResponse(encounter: IEncounter): NextResponse {
  return NextResponse.json({
    success: true,
    encounter: encounter
  });
}

/**
 * Creates a standard error response
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error format
 */
export function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/**
 * Handles async errors and returns standard error response
 * @param error - The error that occurred
 * @param operation - Description of the operation that failed
 * @returns NextResponse with error format
 */
export function handleAsyncError(_error: any, operation: string): NextResponse {
  console.error(`Error ${operation}:`, _error);
  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 }
  );
}