/**
 * Character Service Error Handling
 *
 * Provides centralized error management for character operations.
 * Uses same patterns as UserServiceErrors for consistency.
 */

export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Character service error codes
 */
export const CHARACTER_ERROR_CODES = {
  // Not Found Errors
  CHARACTER_NOT_FOUND: 'CHARACTER_NOT_FOUND',
  OWNER_NOT_FOUND: 'OWNER_NOT_FOUND',
  PARTY_NOT_FOUND: 'PARTY_NOT_FOUND',

  // Validation Errors
  INVALID_CHARACTER_DATA: 'INVALID_CHARACTER_DATA',
  INVALID_CHARACTER_ID: 'INVALID_CHARACTER_ID',
  INVALID_OWNER_ID: 'INVALID_OWNER_ID',
  INVALID_PARTY_ID: 'INVALID_PARTY_ID',
  INVALID_SEARCH_CRITERIA: 'INVALID_SEARCH_CRITERIA',
  INVALID_TEMPLATE_DATA: 'INVALID_TEMPLATE_DATA',

  // Permission Errors
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Business Logic Errors
  CHARACTER_LIMIT_EXCEEDED: 'CHARACTER_LIMIT_EXCEEDED',
  INVALID_CHARACTER_LEVEL: 'INVALID_CHARACTER_LEVEL',
  INVALID_MULTICLASS_COMBINATION: 'INVALID_MULTICLASS_COMBINATION',
  CHARACTER_IN_USE: 'CHARACTER_IN_USE',
  TEMPLATE_CREATION_FAILED: 'TEMPLATE_CREATION_FAILED',

  // Database Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',

  // Generic Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

/**
 * Create a service error
 */
export const createServiceError = (
  code: string,
  message: string,
  details?: Record<string, any>
): ServiceError => ({
  code,
  message,
  details,
});

/**
 * Create a success result
 */
export const createSuccessResult = <T>(data: T): ServiceResult<T> => ({
  success: true,
  data,
});

/**
 * Create an error result
 */
export const createErrorResult = <T>(error: ServiceError): ServiceResult<T> => ({
  success: false,
  error,
});

/**
 * Character service error factory functions
 */
export const CharacterServiceErrors = {
  // Not Found Errors
  characterNotFound: (characterId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.CHARACTER_NOT_FOUND,
      `Character with ID "${characterId}" not found`,
      { characterId }
    ),

  ownerNotFound: (ownerId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.OWNER_NOT_FOUND,
      `Owner with ID "${ownerId}" not found`,
      { ownerId }
    ),

  partyNotFound: (partyId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.PARTY_NOT_FOUND,
      `Party with ID "${partyId}" not found`,
      { partyId }
    ),

  // Validation Errors
  invalidCharacterData: (validationErrors: any[]): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_CHARACTER_DATA,
      'Character data validation failed',
      { validationErrors }
    ),

  invalidCharacterId: (characterId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_CHARACTER_ID,
      `Invalid character ID format: "${characterId}"`,
      { characterId }
    ),

  invalidOwnerId: (ownerId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_OWNER_ID,
      `Invalid owner ID format: "${ownerId}"`,
      { ownerId }
    ),

  invalidPartyId: (partyId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_PARTY_ID,
      `Invalid party ID format: "${partyId}"`,
      { partyId }
    ),

  invalidSearchCriteria: (criteria: Record<string, any>): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_SEARCH_CRITERIA,
      'Invalid search criteria provided',
      { criteria }
    ),

  // Permission Errors
  unauthorizedAccess: (characterId: string, userId: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.UNAUTHORIZED_ACCESS,
      `User "${userId}" is not authorized to access character "${characterId}"`,
      { characterId, userId }
    ),

  insufficientPermissions: (operation: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      `Insufficient permissions for operation: ${operation}`,
      { operation }
    ),

  // Business Logic Errors
  characterLimitExceeded: (currentCount: number, maxAllowed: number): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.CHARACTER_LIMIT_EXCEEDED,
      `Character limit exceeded. Current: ${currentCount}, Maximum: ${maxAllowed}`,
      { currentCount, maxAllowed }
    ),

  invalidCharacterLevel: (level: number): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_CHARACTER_LEVEL,
      `Invalid character level: ${level}. Must be between 1 and 20`,
      { level }
    ),

  invalidMulticlassCombination: (classes: string[]): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INVALID_MULTICLASS_COMBINATION,
      `Invalid multiclass combination: ${classes.join(', ')}`,
      { classes }
    ),

  characterInUse: (characterId: string, usage: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.CHARACTER_IN_USE,
      `Character "${characterId}" is currently in use: ${usage}`,
      { characterId, usage }
    ),

  templateCreationFailed: (reason: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.TEMPLATE_CREATION_FAILED,
      `Template creation failed: ${reason}`,
      { reason }
    ),

  // Database Errors
  databaseError: (operation: string, originalError?: any): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.DATABASE_ERROR,
      `Database error during ${operation}`,
      { operation, originalError: originalError?.message }
    ),

  connectionError: (details?: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.CONNECTION_ERROR,
      `Database connection error${details ? `: ${details}` : ''}`,
      { details }
    ),

  transactionFailed: (operation: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.TRANSACTION_FAILED,
      `Transaction failed during ${operation}`,
      { operation }
    ),

  // Generic Errors
  internalError: (details?: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.INTERNAL_ERROR,
      `Internal server error${details ? `: ${details}` : ''}`,
      { details }
    ),

  operationFailed: (operation: string, reason?: string): ServiceError =>
    createServiceError(
      CHARACTER_ERROR_CODES.OPERATION_FAILED,
      `Operation "${operation}" failed${reason ? `: ${reason}` : ''}`,
      { operation, reason }
    ),
};