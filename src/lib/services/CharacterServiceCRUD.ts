/**
 * Character Service CRUD Operations
 *
 * Handles basic Create, Read, Update, Delete operations for characters.
 * Separated from main service to maintain file size under 500 lines.
 * Refactored to use utility modules to eliminate code duplication.
 */

import { Character, type ICharacter } from '../models/Character';
import type {
  CharacterCreation,
  CharacterUpdate,
} from '../validations/character';
import {
  ServiceResult,
  createErrorResult,
} from './CharacterServiceErrors';
import { CharacterValidationUtils } from './utils/CharacterValidationUtils';
import { CharacterAccessUtils } from './utils/CharacterAccessUtils';
import { CharacterQueryUtils } from './utils/CharacterQueryUtils';
import { ValidationWrapper } from './utils/ValidationWrapper';
import { DatabaseOperationWrapper } from './utils/DatabaseOperationWrapper';
import { OperationWrapper } from './utils/OperationWrapper';

export class CharacterServiceCRUD {

  /**
   * Helper to get validated character data - eliminates duplication
   */
  private static getValidatedCharacterData(characterData: CharacterCreation) {
    const dataValidation = CharacterValidationUtils.validateCharacterData(characterData);
    if (!dataValidation.success) {
      throw new Error(dataValidation.error.message);
    }
    return dataValidation.data;
  }

  /**
   * Helper to get validated update data - eliminates duplication
   */
  private static getValidatedUpdateData(updateData: CharacterUpdate) {
    const dataValidation = CharacterValidationUtils.validateUpdateData(updateData);
    if (!dataValidation.success) {
      throw new Error(dataValidation.error.message);
    }
    return dataValidation.data;
  }

  /**
   * Create a new character
   */
  static async createCharacter(
    ownerId: string,
    characterData: CharacterCreation
  ): Promise<ServiceResult<ICharacter>> {
    const validations = [
      () => CharacterValidationUtils.validateObjectId(ownerId, 'owner'),
      () => CharacterValidationUtils.validateCharacterData(characterData),
    ];

    return ValidationWrapper.validateAndExecute(
      validations,
      async () => {
        // Get validated data
        const validatedData = this.getValidatedCharacterData(characterData);

        // Check character limit
        const countResult = await CharacterQueryUtils.countByOwner(ownerId);
        if (!countResult.success) {
          return createErrorResult(countResult.error);
        }

        const maxCharacters = await this.getCharacterLimitForUser(ownerId);
        const limitValidation = CharacterValidationUtils.validateCharacterLimit(
          countResult.data,
          maxCharacters
        );
        if (!limitValidation.success) {
          return createErrorResult(limitValidation.error);
        }

        // Create character using wrapper
        const ownershipFilter = CharacterAccessUtils.createOwnershipFilter(ownerId) as { ownerId: any };
        return DatabaseOperationWrapper.createAndSave(
          Character,
          {
            ...validatedData,
            ownerId: ownershipFilter.ownerId,
          },
          'character'
        );
      }
    );
  }

  /**
   * Get character by ID
   */
  static async getCharacterById(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<ICharacter>> {
    const validations = [
      () => CharacterValidationUtils.validateMultipleObjectIds([
        { id: characterId, type: 'character' },
        { id: userId, type: 'owner' }
      ])
    ];

    return ValidationWrapper.validateAndExecute(
      validations,
      () => CharacterAccessUtils.checkAccess(characterId, userId)
    );
  }

  /**
   * Update character
   */
  static async updateCharacter(
    characterId: string,
    userId: string,
    updateData: CharacterUpdate
  ): Promise<ServiceResult<ICharacter>> {
    const validations = [
      () => CharacterValidationUtils.validateObjectId(characterId, 'character'),
      () => CharacterValidationUtils.validateUpdateData(updateData),
    ];

    return OperationWrapper.executeWithChecks(
      validations,
      async () => {
        // Check ownership
        const ownershipCheck = await CharacterAccessUtils.checkOwnership(characterId, userId);
        if (!ownershipCheck.success) {
          throw new Error(ownershipCheck.error.message);
        }

        // Get validated data
        const validatedData = this.getValidatedUpdateData(updateData);

        // Update using wrapper
        const updateResult = await DatabaseOperationWrapper.findByIdAndUpdate(
          Character,
          characterId,
          { ...validatedData, updatedAt: new Date() },
          { new: true, runValidators: true },
          'character'
        );

        if (!updateResult.success) {
          throw new Error(updateResult.error.message);
        }

        return updateResult.data;
      },
      'update character'
    );
  }

  /**
   * Delete character
   */
  static async deleteCharacter(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    const validations = [
      () => CharacterValidationUtils.validateObjectId(characterId, 'character'),
    ];

    return OperationWrapper.executeWithChecks(
      validations,
      async () => {
        // Check ownership
        const ownershipCheck = await CharacterAccessUtils.checkOwnership(characterId, userId);
        if (!ownershipCheck.success) {
          throw new Error(ownershipCheck.error.message);
        }

        // Check if character is in use
        const inUseCheck = await CharacterAccessUtils.checkCharacterInUse(characterId);
        if (!inUseCheck.success) {
          throw new Error(inUseCheck.error.message);
        }

        if (inUseCheck.data.inUse) {
          throw new Error(
            `Character ${characterId} is in use: ${inUseCheck.data.usage || 'Unknown'}`
          );
        }

        // Delete using wrapper
        const deleteResult = await DatabaseOperationWrapper.findByIdAndDelete(
          Character,
          characterId,
          'character'
        );

        if (!deleteResult.success) {
          throw new Error(deleteResult.error.message);
        }

        return void 0;
      },
      'delete character'
    );
  }

  // ================================
  // Private Helper Methods
  // ================================

  private static async getCharacterLimitForUser(_userId: string): Promise<number> {
    // TODO: Implement subscription tier checking
    return 10; // Default limit for now
  }
}