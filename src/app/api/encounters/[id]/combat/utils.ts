import { NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { IEncounter } from '@/lib/models/encounter/interfaces';

/**
 * Validates and retrieves an encounter by ID
 */
export async function validateAndGetEncounter(encounterId: string): Promise<{
  encounter: IEncounter | null;
  errorResponse: NextResponse | null;
}> {
  try {
    const encounterResult = await EncounterService.getEncounterById(encounterId);

    if (!encounterResult.success || !encounterResult.data) {
      return {
        encounter: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Encounter not found' },
          { status: 404 }
        )
      };
    }

    return { encounter: encounterResult.data, errorResponse: null };
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
 */
export function findParticipantInInitiative(encounter: IEncounter, participantId: string) {
  return encounter.combatState.initiativeOrder.find(
    entry => entry.participantId.toString() === participantId
  );
}

/**
 * Creates a standard success response
 */
export function createSuccessResponse(encounter: IEncounter): NextResponse {
  return NextResponse.json({
    success: true,
    encounter: encounter
  });
}

/**
 * Creates a standard error response
 */
export function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/**
 * Handles async errors and returns standard error response
 */
export function handleAsyncError(_error: any, operation: string): NextResponse {
  console.error(`Error ${operation}:`, _error);
  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 }
  );
}