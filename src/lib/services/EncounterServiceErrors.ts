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
 * Create standardized error response
 */
function createErrorResponse(message: string, code: string, statusCode: number): ServiceResult<never> {
  return {
    success: false,
    error: { message, code, statusCode },
  };
}

/**
 * Handle EncounterServiceError instances
 */
function handleCustomError(error: EncounterServiceError): ServiceResult<never> {
  return createErrorResponse(error.message, error.code, error.statusCode);
}

/**
 * Handle generic Error instances
 */
function handleGenericError(error: Error): ServiceResult<never> | null {
  const message = error.message.toLowerCase();
  
  if (message.includes('validation')) {
    return createErrorResponse('Invalid encounter data provided', 'VALIDATION_ERROR', 400);
  }
  
  if (message.includes('objectid')) {
    return createErrorResponse('Invalid ID format provided', 'INVALID_ID_FORMAT', 400);
  }
  
  if (message.includes('connection') || message.includes('timeout') || message.includes('econnrefused')) {
    return createErrorResponse('Database connection error', 'DATABASE_ERROR', 503);
  }
  
  return null;
}

/**
 * Handle MongoDB duplicate key errors
 */
function handleDuplicateKeyError(error: unknown): ServiceResult<never> | null {
  if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
    return createErrorResponse('Duplicate encounter data detected', 'DUPLICATE_ENCOUNTER', 409);
  }
  return null;
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
  if (error instanceof EncounterServiceError) {
    return handleCustomError(error);
  }

  if (error instanceof Error) {
    const result = handleGenericError(error);
    if (result) return result;
  }

  const duplicateResult = handleDuplicateKeyError(error);
  if (duplicateResult) return duplicateResult;

  return createErrorResponse(defaultMessage, defaultCode, defaultStatusCode);
}