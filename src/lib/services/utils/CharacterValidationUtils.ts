/**
 * Character Validation Utilities
 * 
 * Centralized validation logic to eliminate duplication across Character service modules.
 * Handles ObjectId validation, character data validation, and common validation patterns.
 */

import { Types } from 'mongoose';
import { characterCreationSchema, characterUpdateSchema } from '../../validations/character';
import type { CharacterCreation, CharacterUpdate } from '../../validations/character';
import { 
  ServiceResult, 
  createSuccessResult, 
  createErrorResult, 
  CharacterServiceErrors 
} from '../CharacterServiceErrors';

export class CharacterValidationUtils {
  /**
   * Validate ObjectId format for different entity types
   */
  static validateObjectId(id: string, type: 'character' | 'owner' | 'party'): ServiceResult<void> {
    if (!Types.ObjectId.isValid(id)) {
      switch (type) {
        case 'character':
          return createErrorResult(CharacterServiceErrors.invalidCharacterId(id));
        case 'owner':
          return createErrorResult(CharacterServiceErrors.invalidOwnerId(id));
        case 'party':
          return createErrorResult(CharacterServiceErrors.invalidPartyId(id));
        default:
          return createErrorResult(CharacterServiceErrors.invalidCharacterId(id));
      }
    }
    return createSuccessResult(void 0);
  }

  /**
   * Validate multiple ObjectIds at once
   */
  static validateMultipleObjectIds(
    ids: { id: string; type: 'character' | 'owner' | 'party' }[]
  ): ServiceResult<void> {
    for (const { id, type } of ids) {
      const validation = this.validateObjectId(id, type);
      if (!validation.success) {
        return validation;
      }
    }
    return createSuccessResult(void 0);
  }

  /**
   * Validate character creation data
   */
  static validateCharacterData(characterData: any): ServiceResult<CharacterCreation> {
    try {
      const validationResult = characterCreationSchema.safeParse(characterData);
      if (!validationResult.success) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterData(validationResult.error.errors)
        );
      }

      // Additional business rule validations
      const businessValidation = this.validateBusinessRules(validationResult.data);
      if (!businessValidation.success) {
        return businessValidation;
      }

      return createSuccessResult(validationResult.data);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.invalidCharacterData([{ message: 'Validation failed' }])
      );
    }
  }

  /**
   * Validate character update data
   */
  static validateUpdateData(updateData: any): ServiceResult<CharacterUpdate> {
    try {
      const validationResult = characterUpdateSchema.safeParse(updateData);
      if (!validationResult.success) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterData(validationResult.error.errors)
        );
      }

      return createSuccessResult(validationResult.data);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.invalidCharacterData([{ message: 'Update validation failed' }])
      );
    }
  }

  /**
   * Validate search criteria
   */
  static validateSearchCriteria(searchTerm: string): ServiceResult<string> {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length === 0) {
      return createErrorResult(
        CharacterServiceErrors.invalidSearchCriteria({ searchTerm })
      );
    }
    return createSuccessResult(trimmed);
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page: number = 1, limit: number = 20): ServiceResult<{ page: number; limit: number; skip: number }> {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    const skip = (validPage - 1) * validLimit;

    return createSuccessResult({
      page: validPage,
      limit: validLimit,
      skip,
    });
  }

  /**
   * Validate character level constraints
   */
  static validateCharacterLevel(level: number): ServiceResult<void> {
    if (level < 1 || level > 20) {
      return createErrorResult(CharacterServiceErrors.invalidCharacterLevel(level));
    }
    return createSuccessResult(void 0);
  }

  /**
   * Validate character limit constraints
   */
  static validateCharacterLimit(currentCount: number, maxAllowed: number = 10): ServiceResult<void> {
    if (currentCount >= maxAllowed) {
      return createErrorResult(
        CharacterServiceErrors.characterLimitExceeded(currentCount, maxAllowed)
      );
    }
    return createSuccessResult(void 0);
  }

  /**
   * Business rule validations that go beyond schema validation
   */
  private static validateBusinessRules(characterData: CharacterCreation): ServiceResult<void> {
    // Validate total character level
    const totalLevel = characterData.classes.reduce((sum, cls) => sum + cls.level, 0);
    const levelValidation = this.validateCharacterLevel(totalLevel);
    if (!levelValidation.success) {
      return levelValidation;
    }

    // Validate multiclass combinations (if needed)
    if (characterData.classes.length > 1) {
      const classNames = characterData.classes.map(cls => cls.class);
      const uniqueClasses = new Set(classNames);
      if (uniqueClasses.size !== classNames.length) {
        return createErrorResult(
          CharacterServiceErrors.invalidMulticlassCombination(classNames)
        );
      }
    }

    return createSuccessResult(void 0);
  }
}