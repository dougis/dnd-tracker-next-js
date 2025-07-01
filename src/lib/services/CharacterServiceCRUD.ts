/**
 * Character Service CRUD Operations
 *
 * Handles basic Create, Read, Update, Delete operations for characters.
 * Separated from main service to maintain file size under 500 lines.
 */

import { Types } from 'mongoose';
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
import {
  characterCreationSchema,
  characterUpdateSchema,
} from '../validations/character';

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
      if (!Types.ObjectId.isValid(ownerId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(ownerId));
      }

      // Validate character data
      const validationResult = characterCreationSchema.safeParse(characterData);
      if (!validationResult.success) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterData(validationResult.error.errors)
        );
      }

      const validatedData = validationResult.data;

      // Check character limit for subscription tier (mock implementation)
      const characterCount = await Character.countDocuments({ ownerId: new Types.ObjectId(ownerId) });
      const maxCharacters = await this.getCharacterLimitForUser(ownerId);

      if (characterCount >= maxCharacters) {
        return createErrorResult(
          CharacterServiceErrors.characterLimitExceeded(characterCount, maxCharacters)
        );
      }

      // Create character
      const character = new Character({
        ...validatedData,
        ownerId: new Types.ObjectId(ownerId),
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
    try {
      // Validate IDs
      if (!Types.ObjectId.isValid(characterId)) {
        return createErrorResult(CharacterServiceErrors.invalidCharacterId(characterId));
      }
      if (!Types.ObjectId.isValid(userId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(userId));
      }

      // Find character
      const character = await Character.findById(characterId);
      if (!character) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(characterId));
      }

      // Check access permissions
      const hasAccess = await this.checkCharacterAccess(characterId, userId);
      if (!hasAccess.success) {
        return hasAccess;
      }

      return createSuccessResult(character);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get character', error)
      );
    }
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
      // Validate IDs
      if (!Types.ObjectId.isValid(characterId)) {
        return createErrorResult(CharacterServiceErrors.invalidCharacterId(characterId));
      }

      // Validate update data
      const validationResult = characterUpdateSchema.safeParse(updateData);
      if (!validationResult.success) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterData(validationResult.error.errors)
        );
      }

      // Check ownership
      const ownershipCheck = await this.checkCharacterOwnership(characterId, userId);
      if (!ownershipCheck.success) {
        return ownershipCheck;
      }

      // Update character
      const character = await Character.findByIdAndUpdate(
        characterId,
        { ...validationResult.data, updatedAt: new Date() },
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
      // Validate IDs
      if (!Types.ObjectId.isValid(characterId)) {
        return createErrorResult(CharacterServiceErrors.invalidCharacterId(characterId));
      }

      // Check ownership
      const ownershipCheck = await this.checkCharacterOwnership(characterId, userId);
      if (!ownershipCheck.success) {
        return ownershipCheck;
      }

      // Check if character is in use
      const inUseCheck = await this.checkCharacterInUse(characterId);
      if (!inUseCheck.success) {
        return inUseCheck;
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

  private static async checkCharacterInUse(_characterId: string): Promise<ServiceResult<void>> {
    // TODO: Check if character is in active encounters
    return createSuccessResult(void 0);
  }

  private static async checkCharacterOwnership(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      if (!Types.ObjectId.isValid(characterId) || !Types.ObjectId.isValid(userId)) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterId(characterId)
        );
      }

      const character = await Character.findById(characterId);
      if (!character) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(characterId));
      }

      if (character.ownerId.toString() !== userId) {
        return createErrorResult(
          CharacterServiceErrors.unauthorizedAccess(characterId, userId)
        );
      }

      return createSuccessResult(void 0);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('check character ownership', error)
      );
    }
  }

  private static async checkCharacterAccess(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(characterId));
      }

      // Allow access if user owns the character or character is public
      if (character.ownerId.toString() === userId || character.isPublic) {
        return createSuccessResult(void 0);
      }

      return createErrorResult(
        CharacterServiceErrors.unauthorizedAccess(characterId, userId)
      );

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('check character access', error)
      );
    }
  }
}