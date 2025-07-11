/**
 * Character Validation Service
 *
 * Enhanced character validation and error handling service that extends the existing
 * CharacterService with comprehensive validation, error recovery, and user guidance.
 */

import { CharacterValidationUtils } from './utils/CharacterValidationUtils';
import {
  type ServiceResult,
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from './CharacterServiceErrors';
import {
  RealtimeValidator,
  CharacterConsistencyChecker,
  type EnhancedCharacterCreation,
  type EnhancedCharacterUpdate,
  type ConsistencyWarning,
} from '../validations/character-enhanced';
import {
  CharacterDataRecovery,
  type ValidationErrorWithFix,
  type CharacterBackup,
} from '../validations/error-recovery';
import type { CharacterCreation } from '../validations/character';

export interface ValidationContext {
  userId: string;
  characterId?: string;
  operationType: 'create' | 'update' | 'import' | 'duplicate';
  skipBusinessRules?: boolean;
}

export interface EnhancedValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationErrorWithFix[];
  warnings: ConsistencyWarning[];
  suggestions: string[];
  autoFixable?: boolean;
  autoFixData?: Partial<T>;
}

export interface CharacterValidationOptions {
  enableConsistencyChecks: boolean;
  enableAutoFix: boolean;
  enableDataRecovery: boolean;
  strictMode: boolean;
  validateBusinessRules: boolean;
}

export class CharacterValidationService {
  private static defaultOptions: CharacterValidationOptions = {
    enableConsistencyChecks: true,
    enableAutoFix: true,
    enableDataRecovery: true,
    strictMode: false,
    validateBusinessRules: true,
  };

  /**
   * Comprehensive character creation validation with enhanced error handling
   */
  static async validateCharacterCreation(
    characterData: unknown,
    context: ValidationContext,
    options: Partial<CharacterValidationOptions> = {}
  ): Promise<EnhancedValidationResult<EnhancedCharacterCreation>> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Step 1: Basic schema validation with auto-fix suggestions
      const recoveryResult = CharacterDataRecovery.validateWithRecovery(characterData as Partial<CharacterCreation>);


      if (!recoveryResult.isValid) {
        return {
          success: false,
          errors: recoveryResult.errors,
          warnings: [],
          suggestions: CharacterDataRecovery.generateRecoverySuggestions(characterData as Partial<CharacterCreation>),
          autoFixable: !!recoveryResult.autoFixableData,
          autoFixData: recoveryResult.autoFixableData,
        };
      }

      // Step 2: Use the working validation directly from CharacterValidationUtils
      const directValidation = CharacterValidationUtils.validateCharacterData(characterData);

      if (!directValidation.success) {
        const errors: ValidationErrorWithFix[] = [{
          name: 'ValidationError',
          message: directValidation.error.message,
          field: 'general',
          code: directValidation.error.code,
          suggestedFix: this.generateSuggestedFix('general', directValidation.error.message),
          autoFixable: this.isAutoFixable('general', directValidation.error.message),
        }];

        return {
          success: false,
          errors,
          warnings: [],
          suggestions: this.generateValidationSuggestions(errors),
          autoFixable: errors.some(e => e.autoFixable),
        };
      }

      // Use the validated data from the working validation
      const validatedData = directValidation.data;

      // Step 3: Business rule validation (if enabled)
      if (opts.validateBusinessRules) {
        const businessValidation = await this.validateBusinessRules(
          validatedData,
          context
        );

        if (!businessValidation.success) {
          return {
            success: false,
            data: validatedData,
            errors: [businessValidation.error] as ValidationErrorWithFix[],
            warnings: [],
            suggestions: ['Please check business rule requirements'],
          };
        }
      }

      // Step 4: Consistency checks (if enabled)
      let warnings: ConsistencyWarning[] = [];
      if (opts.enableConsistencyChecks) {
        warnings = CharacterConsistencyChecker.checkConsistency(validatedData);
      }

      // Step 5: Create backup if data recovery is enabled
      if (opts.enableDataRecovery && context.characterId) {
        CharacterDataRecovery.createBackup(
          validatedData,
          context.operationType === 'create' ? 'auto-save' : 'pre-operation',
          context.characterId
        );
      }

      return {
        success: true,
        data: validatedData,
        errors: [],
        warnings,
        suggestions: warnings.length > 0
          ? warnings.map(w => w.suggestion).filter(Boolean) as string[]
          : ['Character validation passed successfully'],
      };

    } catch (error) {
      return {
        success: false,
        errors: [{
          name: 'ValidationError',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          field: 'general',
          suggestedFix: 'Please try again or contact support',
        }] as ValidationErrorWithFix[],
        warnings: [],
        suggestions: ['An unexpected error occurred during validation'],
      };
    }
  }

  /**
   * Comprehensive character update validation
   */
  static async validateCharacterUpdate(
    updateData: unknown,
    existingCharacter: CharacterCreation,
    context: ValidationContext,
    options: Partial<CharacterValidationOptions> = {}
  ): Promise<EnhancedValidationResult<EnhancedCharacterUpdate>> {
    const _opts = { ...this.defaultOptions, ...options };

    try {
      // First validate just the update data using the CharacterValidationUtils
      const initialUpdateValidation = CharacterValidationUtils.validateUpdateData(updateData);
      if (!initialUpdateValidation.success) {
        const errors: ValidationErrorWithFix[] = [{
          name: 'ValidationError',
          message: initialUpdateValidation.error.message,
          field: 'general',
          code: initialUpdateValidation.error.code,
          suggestedFix: this.generateSuggestedFix('general', initialUpdateValidation.error.message),
          autoFixable: this.isAutoFixable('general', initialUpdateValidation.error.message),
        }];

        return {
          success: false,
          errors,
          warnings: [],
          suggestions: this.generateValidationSuggestions(errors),
        };
      }

      // Merge update data with existing character for full validation
      const mergedData = this.deepMerge(existingCharacter, updateData as Partial<CharacterCreation>);

      // Validate the merged result as a complete character
      const fullValidation = await this.validateCharacterCreation(
        mergedData,
        { ...context, operationType: 'update' },
        options
      );

      if (!fullValidation.success) {
        return {
          ...fullValidation,
          data: undefined,
        };
      }

      return {
        success: true,
        data: initialUpdateValidation.data as EnhancedCharacterUpdate,
        errors: [],
        warnings: fullValidation.warnings,
        suggestions: fullValidation.suggestions,
      };

    } catch (error) {
      return {
        success: false,
        errors: [{
          name: 'ValidationError',
          message: error instanceof Error ? error.message : 'Unknown update validation error',
          field: 'general',
          suggestedFix: 'Please check your update data and try again',
        }] as ValidationErrorWithFix[],
        warnings: [],
        suggestions: ['Update validation encountered an error'],
      };
    }
  }

  /**
   * Real-time field validation for form components
   */
  static validateFieldRealtime(
    fieldName: string,
    value: any,
    fullCharacter?: Partial<CharacterCreation>
  ): ValidationErrorWithFix | null {
    const error = RealtimeValidator.validateFieldValue(fieldName, value, fullCharacter);

    if (!error) return null;

    return {
      ...error,
      message: error.message,
      suggestedFix: this.generateSuggestedFix(fieldName, error.message),
      autoFixable: this.isAutoFixable(fieldName, error.message),
      autoFixValue: this.generateAutoFixValue(fieldName, value),
    };
  }

  /**
   * Character data recovery operations
   */
  static getCharacterBackups(characterId: string): CharacterBackup[] {
    return CharacterDataRecovery.getCharacterBackups(characterId);
  }

  static restoreCharacterFromBackup(backupId: string): ServiceResult<Partial<CharacterCreation>> {
    try {
      const data = CharacterDataRecovery.restoreFromBackup(backupId);
      if (!data) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(backupId));
      }
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(CharacterServiceErrors.operationFailed(
        'restore-backup',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  static createCharacterBackup(
    characterData: Partial<CharacterCreation>,
    characterId?: string
  ): CharacterBackup {
    return CharacterDataRecovery.createBackup(characterData, 'manual', characterId);
  }

  /**
   * Character import validation with enhanced error reporting
   */
  static async validateCharacterImport(
    importData: unknown,
    context: ValidationContext
  ): Promise<EnhancedValidationResult<EnhancedCharacterCreation>> {
    // Additional import-specific validations can be added here
    return this.validateCharacterCreation(
      importData,
      { ...context, operationType: 'import' },
      { enableConsistencyChecks: true, strictMode: true }
    );
  }

  /**
   * Batch character validation for multiple characters
   */
  static async validateMultipleCharacters(
    charactersData: unknown[],
    context: Omit<ValidationContext, 'characterId'>
  ): Promise<EnhancedValidationResult<EnhancedCharacterCreation>[]> {
    const results: EnhancedValidationResult<EnhancedCharacterCreation>[] = [];

    for (let i = 0; i < charactersData.length; i++) {
      const result = await this.validateCharacterCreation(
        charactersData[i],
        { ...context, characterId: `batch_${i}` }
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Generate user-friendly error messages with context
   */
  private static generateSuggestedFix(field: string | undefined, _message: string): string {
    if (!field) return 'Please check the input and try again';

    const fieldLower = field.toLowerCase();

    if (fieldLower.includes('name')) {
      return 'Character names should be 1-100 characters long and contain valid characters';
    }

    if (fieldLower.includes('abilityscores')) {
      return 'Ability scores should be between 1-30 (8-15 is typical for most characters)';
    }

    if (fieldLower.includes('hitpoints')) {
      return 'Hit points should be positive, and current HP should not exceed maximum HP';
    }

    if (fieldLower.includes('armorclass')) {
      return 'Armor Class should be at least 10 (base AC + Dex modifier + armor bonus)';
    }

    if (fieldLower.includes('level')) {
      return 'Character levels should be between 1-20';
    }

    if (fieldLower.includes('race')) {
      return 'Please select a valid race from the list, or provide a custom race name';
    }

    if (fieldLower.includes('class')) {
      return 'Please select valid character classes (maximum 3 for multiclassing)';
    }

    return 'Please verify this field meets the requirements';
  }

  private static isAutoFixable(field: string | undefined, _message: string): boolean {
    if (!field) return false;

    const fieldLower = field.toLowerCase();

    // Ability scores can be auto-fixed to reasonable ranges
    if (fieldLower.includes('abilityscores')) {
      return true;
    }

    // Levels can be auto-fixed to valid ranges
    if (fieldLower.includes('level')) {
      return true;
    }

    // Hit points can be auto-fixed for basic range issues
    if (fieldLower.includes('hitpoints.temporary')) {
      return true;
    }

    return false;
  }

  private static generateAutoFixValue(field: string, currentValue: any): any {
    const fieldLower = field.toLowerCase();

    if (fieldLower.includes('abilityscores')) {
      if (currentValue < 1) return 8;
      if (currentValue > 30) return 20;
    }

    if (fieldLower.includes('level')) {
      if (currentValue < 1) return 1;
      if (currentValue > 20) return 20;
    }

    if (fieldLower.includes('hitpoints.temporary')) {
      if (currentValue < 0) return 0;
    }

    return currentValue;
  }

  private static generateValidationSuggestions(errors: ValidationErrorWithFix[]): string[] {
    const suggestions: string[] = [];

    errors.forEach(error => {
      if (error.suggestedFix) {
        suggestions.push(error.suggestedFix);
      }
    });

    if (suggestions.length === 0) {
      suggestions.push('Please review the form for any validation errors');
    }

    return Array.from(new Set(suggestions)); // Remove duplicates
  }

  private static async validateBusinessRules(
    characterData: EnhancedCharacterCreation,
    _context: ValidationContext
  ): Promise<ServiceResult<void>> {
    // Use existing validation utils for business rules
    const result = CharacterValidationUtils.validateCharacterData(characterData);
    if (result.success) {
      return createSuccessResult(undefined);
    }
    return result;
  }

  private static deepMerge(target: any, source: any): any {
    if (!target || typeof target !== 'object') {
      return source;
    }

    if (!source || typeof source !== 'object') {
      return target;
    }

    const result = { ...target };

    for (const key in source) {
      if (source[key] !== null && source[key] !== undefined) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) &&
            target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          // Deep merge objects only if both are objects and target[key] exists
          result[key] = this.deepMerge(target[key], source[key]);
        } else {
          // Direct assignment for primitives, arrays, or when target doesn't have the key
          result[key] = source[key];
        }
      }
    }

    return result;
  }
}