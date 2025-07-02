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
/**
 * Create error response with given details
 */
function createErrorResponse(
  message: string,
  code: string,
  statusCode: number
): ServiceResult<never> {
  return {
    success: false,
    error: { message, code, statusCode },
  };
}

/**
 * Handle EncounterServiceError instances
 */
function handleServiceError(error: EncounterServiceError): ServiceResult<never> {
  return createErrorResponse(error.message, error.code, error.statusCode);
}

/**
 * Handle MongoDB validation errors
 */
function handleValidationError(): ServiceResult<never> {
  return createErrorResponse(
    'Invalid encounter data provided',
    'VALIDATION_ERROR',
    400
  );
}

/**
 * Handle MongoDB duplicate key errors
 */
function handleDuplicateKeyError(): ServiceResult<never> {
  return createErrorResponse(
    'Duplicate encounter data detected',
    'DUPLICATE_ENCOUNTER',
    409
  );
}

/**
 * Handle MongoDB ObjectId casting errors
 */
function handleObjectIdError(): ServiceResult<never> {
  return createErrorResponse(
    'Invalid ID format provided',
    'INVALID_ID_FORMAT',
    400
  );
}

/**
 * Handle database connection errors
 */
function handleConnectionError(): ServiceResult<never> {
  return createErrorResponse(
    'Database connection error',
    'DATABASE_ERROR',
    503
  );
}

/**
 * Check if error is a MongoDB duplicate key error
 */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as any).code === 11000
  );
}

/**
 * Check if error is a connection-related error
 */
function isConnectionError(error: Error): boolean {
  return (
    error.message.includes('connection') ||
    error.message.includes('timeout') ||
    error.message.includes('ECONNREFUSED')
  );
}

export function handleEncounterServiceError(
  error: unknown,
  defaultMessage: string,
  defaultCode: string,
  defaultStatusCode: number = 500
): ServiceResult<never> {
  if (error instanceof EncounterServiceError) {
    return handleServiceError(error);
  }

  if (error instanceof Error) {
    if (error.message.includes('validation')) {
      return handleValidationError();
    }
    if (error.message.includes('ObjectId')) {
      return handleObjectIdError();
    }
    if (isConnectionError(error)) {
      return handleConnectionError();
    }
  }

  if (isDuplicateKeyError(error)) {
    return handleDuplicateKeyError();
  }

  return createErrorResponse(defaultMessage, defaultCode, defaultStatusCode);
}