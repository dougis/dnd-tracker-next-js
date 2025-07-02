/**
 * Custom error classes and error handling utilities for EncounterService
 */

import { ServiceResult } from './UserServiceErrors';

// Custom error classes for encounter-specific errors
export class EncounterServiceError extends Error {
  public code: string;

  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'EncounterServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class EncounterNotFoundError extends EncounterServiceError {
  constructor(identifier: string) {
    super(`Encounter not found: ${identifier}`, 'ENCOUNTER_NOT_FOUND', 404);
  }
}

export class ParticipantNotFoundError extends EncounterServiceError {
  constructor(participantId: string) {
    super(`Participant not found: ${participantId}`, 'PARTICIPANT_NOT_FOUND', 404);
  }
}

export class InvalidEncounterIdError extends EncounterServiceError {
  constructor(id: string) {
    super(`Invalid encounter ID format: ${id}`, 'INVALID_ENCOUNTER_ID', 400);
  }
}

export class EncounterPermissionError extends EncounterServiceError {
  constructor(action: string) {
    super(`Permission denied for encounter ${action}`, 'ENCOUNTER_PERMISSION_DENIED', 403);
  }
}

export class EncounterValidationError extends EncounterServiceError {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`, 'ENCOUNTER_VALIDATION_ERROR', 400);
  }
}

export class CombatStateError extends EncounterServiceError {
  constructor(action: string, reason: string) {
    super(`Cannot ${action}: ${reason}`, 'COMBAT_STATE_ERROR', 409);
  }
}

/**
 * Handle errors and convert them to ServiceResult error format for encounters
 */
export function handleEncounterServiceError(
  error: unknown,
  defaultMessage: string,
  defaultCode: string,
  defaultStatusCode: number = 500
): ServiceResult<never> {
  // Handle custom service errors
  if (error instanceof EncounterServiceError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }

  // Handle common error types
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('validation')) {
      return {
        success: false,
        error: {
          message: 'Invalid encounter data provided',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        },
      };
    }

    if (message.includes('objectid')) {
      return {
        success: false,
        error: {
          message: 'Invalid ID format provided',
          code: 'INVALID_ID_FORMAT',
          statusCode: 400,
        },
      };
    }

    if (message.includes('connection') || message.includes('timeout') || message.includes('econnrefused')) {
      return {
        success: false,
        error: {
          message: 'Database connection error',
          code: 'DATABASE_ERROR',
          statusCode: 503,
        },
      };
    }
  }

  // Handle MongoDB duplicate key errors
  if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
    return {
      success: false,
      error: {
        message: 'Duplicate encounter data detected',
        code: 'DUPLICATE_ENCOUNTER',
        statusCode: 409,
      },
    };
  }

  // Default error response
  return {
    success: false,
    error: {
      message: defaultMessage,
      code: defaultCode,
      statusCode: defaultStatusCode,
    },
  };
}