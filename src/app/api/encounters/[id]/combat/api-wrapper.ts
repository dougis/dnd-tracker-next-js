import { NextRequest, NextResponse } from 'next/server';
import {
  validateAndGetEncounter,
  validateCombatActive,
  createSuccessResponse,
  createErrorResponse,
  handleAsyncError,
  validateRequiredFields,
  findParticipantInInitiative
} from './utils';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

/**
 * Configuration for combat API endpoint
 */
export interface CombatApiConfig {
  operation: string;
  requireBody?: boolean;
  requiredFields?: string[];
  validatePaused?: boolean;
  validateNotPaused?: boolean;
  validateTurnHistory?: boolean;
  findParticipant?: boolean;
}

/**
 * Handler function type for combat operations
 */
export type CombatHandler = (
  _encounter: IEncounter,
  _body?: any,
  _participant?: any
) => Promise<boolean | NextResponse> | boolean | NextResponse;

/**
 * Higher-order function that wraps combat API endpoints with common validation and error handling
 */
export function withCombatValidation(
  config: CombatApiConfig,
  handler: CombatHandler
) {
  return async function(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: encounterId } = await context.params;

      // Parse body if required
      let body;
      if (config.requireBody || config.requiredFields) {
        body = await request.json();

        // Validate required fields
        if (config.requiredFields) {
          const fieldsError = validateRequiredFields(body, config.requiredFields);
          if (fieldsError) return fieldsError;
        }
      }

      // Validate and get encounter
      const { encounter, errorResponse } = await validateAndGetEncounter(encounterId);
      if (errorResponse) return errorResponse;

      // Validate combat is active
      const combatError = validateCombatActive(encounter!);
      if (combatError) return combatError;

      // Additional validations based on config
      const validationError = performAdditionalValidations(encounter!, config);
      if (validationError) return validationError;

      // Find participant if required
      let participant;
      if (config.findParticipant && body?.participantId) {
        participant = findParticipantInInitiative(encounter!, body.participantId);
        if (!participant) {
          return createErrorResponse('Participant not found', 400);
        }
      }

      // Execute the handler
      const result = await handler(encounter!, body, participant);

      // Handle different return types
      if (result instanceof Response) {
        return result as NextResponse;
      }

      if (typeof result === 'boolean' && !result) {
        return createErrorResponse(`Unable to ${config.operation}`, 400);
      }

      // Save and return success
      await encounter!.save();
      return createSuccessResponse(encounter!);

    } catch (error) {
      return handleAsyncError(error, config.operation);
    }
  };
}

/**
 * Perform additional validations based on configuration
 */
function performAdditionalValidations(
  encounter: IEncounter,
  config: CombatApiConfig
): NextResponse | null {
  if (config.validatePaused && !encounter.combatState.pausedAt) {
    return createValidationErrorResponse('Combat is not paused', 400);
  }

  if (config.validateNotPaused && encounter.combatState.pausedAt) {
    return createValidationErrorResponse('Combat is paused', 400);
  }

  if (config.validateTurnHistory) {
    const { currentTurn, currentRound } = encounter.combatState;
    if (currentTurn === 0 && currentRound === 1) {
      return createValidationErrorResponse('No previous turn available', 400);
    }
  }

  return null;
}

/**
 * Utility to create error response from validation
 */
function createValidationErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}