/**
 * Central validation export file for the D&D Encounter Tracker
 *
 * This file provides a single point of import for all validation schemas,
 * types, and utilities used throughout the application.
 */

// Base validation utilities
export * from './base';

// User authentication and management
export * from './user';

// Character management (PCs and NPCs)
export * from './character';

// Form integration with React Hook Form
export * from './form-integration';

// Re-export Zod for convenience
export { z } from 'zod';

// Common validation patterns (re-exported for convenience)
export {
  emailSchema,
  passwordSchema,
  usernameSchema,
  nameSchema,
  objectIdSchema,
  abilityScoreSchema,
  levelSchema,
  hitPointsSchema,
  armorClassSchema,
  initiativeSchema,
  challengeRatingSchema,
  dateSchema,
  createOptionalSchema,
  createArraySchema,
  createPaginationSchema,
  safeValidate,
  handleValidationError,
  ValidationError,
} from './base';

// User validation shortcuts
export {
  userRegistrationSchema,
  userLoginSchema,
  userProfileUpdateSchema,
  changePasswordSchema,
  passwordResetSchema,
  passwordResetRequestSchema,
  userSessionSchema,
} from './user';

// Character validation shortcuts
export {
  characterCreationSchema,
  characterUpdateSchema,
  characterSummarySchema,
  characterCombatSchema,
  abilityScoresSchema,
  characterClassSchema,
  characterRaceSchema,
} from './character';

// Form integration shortcuts
export {
  createFormResolver,
  createFormOptions,
  validateFormSubmission,
  useFormValidation,
  createServerValidator,
} from './form-integration';
