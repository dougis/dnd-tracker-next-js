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
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from './CharacterServiceErrors';
import { CharacterValidationUtils } from './utils/CharacterValidationUtils';
import { CharacterAccessUtils } from './utils/CharacterAccessUtils';
import { CharacterQueryUtils } from './utils/CharacterQueryUtils';

export class CharacterServiceCRUD {

  /**
   * Create a new character
   */
  static async createCharacter(
    ownerId: string,
    characterData: CharacterCreation
  ): Promise<ServiceResult<ICharacter>> {
    try {
      // Validate owner ID
      const ownerValidation = CharacterValidationUtils.validateObjectId(ownerId, 'owner');
      if (!ownerValidation.success) {
        return createErrorResult(ownerValidation.error);
      }

      // Validate character data
      const dataValidation = CharacterValidationUtils.validateCharacterData(characterData);
      if (!dataValidation.success) {
        return createErrorResult(dataValidation.error);
      }
      const validatedData = dataValidation.data;

      // Check character limit
      const countResult = await CharacterQueryUtils.countByOwner(ownerId);
      if (!countResult.success) {
        return createErrorResult(countResult.error);
      }

      const maxCharacters = await this.getCharacterLimitForUser(ownerId);
      const limitValidation = CharacterValidationUtils.validateCharacterLimit(countResult.data, maxCharacters);
      if (!limitValidation.success) {
        return createErrorResult(limitValidation.error);
      }

      // Create character using utility
      const ownershipFilter = CharacterAccessUtils.createOwnershipFilter(ownerId) as { ownerId: any };
      const character = new Character({
        ...validatedData,
        ownerId: ownershipFilter.ownerId,
      });

      const savedCharacter = await character.save();
      return createSuccessResult(savedCharacter);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('create character', error)
      );
    }
  }

  /**
   * Get character by ID
   */
  static async getCharacterById(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<ICharacter>> {
    // Validate IDs and check access using utility
    const idsValidation = CharacterValidationUtils.validateMultipleObjectIds([
      { id: characterId, type: 'character' },
      { id: userId, type: 'owner' }
    ]);
    if (!idsValidation.success) {
      return createErrorResult(idsValidation.error);
    }

    // Check access and get character in one operation
    return CharacterAccessUtils.checkAccess(characterId, userId);
  }

  /**
   * Update character
   */
  static async updateCharacter(
    characterId: string,
    userId: string,
    updateData: CharacterUpdate
  ): Promise<ServiceResult<ICharacter>> {
    try {
      // Validate character ID
      const idValidation = CharacterValidationUtils.validateObjectId(characterId, 'character');
      if (!idValidation.success) {
        return createErrorResult(idValidation.error);
      }

      // Validate update data
      const dataValidation = CharacterValidationUtils.validateUpdateData(updateData);
      if (!dataValidation.success) {
        return createErrorResult(dataValidation.error);
      }

      // Check ownership
      const ownershipCheck = await CharacterAccessUtils.checkOwnership(characterId, userId);
      if (!ownershipCheck.success) {
        return createErrorResult(ownershipCheck.error);
      }

      // Update character
      const character = await Character.findByIdAndUpdate(
        characterId,
        { ...dataValidation.data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!character) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(characterId));
      }

      return createSuccessResult(character);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('update character', error)
      );
    }
  }

  /**
   * Delete character
   */
  static async deleteCharacter(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Validate character ID
      const idValidation = CharacterValidationUtils.validateObjectId(characterId, 'character');
      if (!idValidation.success) {
        return createErrorResult(idValidation.error);
      }

      // Check ownership
      const ownershipCheck = await CharacterAccessUtils.checkOwnership(characterId, userId);
      if (!ownershipCheck.success) {
        return createErrorResult(ownershipCheck.error);
      }

      // Check if character is in use
      const inUseCheck = await CharacterAccessUtils.checkCharacterInUse(characterId);
      if (!inUseCheck.success) {
        return createErrorResult(inUseCheck.error);
      }

      if (inUseCheck.data.inUse) {
        return createErrorResult(
          CharacterServiceErrors.characterInUse(characterId, inUseCheck.data.usage || 'Unknown')
        );
      }

      // Delete character
      const character = await Character.findByIdAndDelete(characterId);
      if (!character) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(characterId));
      }

      return createSuccessResult(void 0);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('delete character', error)
      );
    }
  }

  // ================================
  // Private Helper Methods
  // ================================

  private static async getCharacterLimitForUser(_userId: string): Promise<number> {
    // TODO: Implement subscription tier checking
    return 10; // Default limit for now
  }
}