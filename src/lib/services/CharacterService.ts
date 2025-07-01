/**
 * Character Service Layer for D&D Encounter Tracker
 *
 * Main coordination layer that delegates operations to specialized modules.
 * This class acts as a facade to maintain a clean API while keeping
 * individual modules focused and under 500 lines each.
 */

import { Types } from 'mongoose';
import { Character, type ICharacter } from '../models/Character';
import type {
  CharacterCreation,
  CharacterUpdate,
  CharacterSummary,
  CharacterPreset,
  CharacterClass,
  CharacterRace,
  CharacterType,
} from '../validations/character';
import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from './CharacterServiceErrors';
import { characterCreationSchema } from '../validations/character';

// Import specialized service modules
import { CharacterServiceCRUD } from './CharacterServiceCRUD';
import {
  CharacterServiceSearch,
  type PaginatedCharacters
} from './CharacterServiceSearch';
import {
  CharacterServiceStats,
  type CharacterStats,
  type SpellcastingStats,
  type CarryingCapacity,
  type EquipmentWeight,
  type ExperienceInfo,
} from './CharacterServiceStats';
import {
  CharacterServiceTemplates,
  type BulkOperationResult,
} from './CharacterServiceTemplates';

export interface CharacterPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}

/**
 * Character Service Layer - Main Facade
 */
export class CharacterService {
  // ================================
  // CRUD Operations - Delegate to CharacterServiceCRUD
  // ================================

  static async createCharacter(
    ownerId: string,
    characterData: CharacterCreation
  ): Promise<ServiceResult<ICharacter>> {
    return CharacterServiceCRUD.createCharacter(ownerId, characterData);
  }

  static async getCharacterById(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<ICharacter>> {
    return CharacterServiceCRUD.getCharacterById(characterId, userId);
  }

  static async updateCharacter(
    characterId: string,
    userId: string,
    updateData: CharacterUpdate
  ): Promise<ServiceResult<ICharacter>> {
    return CharacterServiceCRUD.updateCharacter(characterId, userId, updateData);
  }

  static async deleteCharacter(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    return CharacterServiceCRUD.deleteCharacter(characterId, userId);
  }

  // ================================
  // Search and Filtering - Delegate to CharacterServiceSearch
  // ================================

  static async getCharactersByOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ServiceResult<PaginatedCharacters>> {
    return CharacterServiceSearch.getCharactersByOwner(ownerId, page, limit);
  }

  static async searchCharacters(
    searchTerm: string,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterServiceSearch.searchCharacters(searchTerm, userId);
  }

  static async getCharactersByClass(
    className: CharacterClass,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterServiceSearch.getCharactersByClass(className, userId);
  }

  static async getCharactersByRace(
    race: CharacterRace,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterServiceSearch.getCharactersByRace(race, userId);
  }

  static async getCharactersByType(
    type: CharacterType,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterServiceSearch.getCharactersByType(type, userId);
  }

  static async getPublicCharacters(): Promise<ServiceResult<ICharacter[]>> {
    return CharacterServiceSearch.getPublicCharacters();
  }

  // ================================
  // Statistics and Calculations - Delegate to CharacterServiceStats
  // ================================

  static async calculateCharacterStats(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterStats>> {
    return CharacterServiceStats.calculateCharacterStats(characterId, userId);
  }

  static async getCharacterSummary(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterSummary>> {
    return CharacterServiceStats.getCharacterSummary(characterId, userId);
  }

  static async calculateSpellcastingStats(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<SpellcastingStats>> {
    return CharacterServiceStats.calculateSpellcastingStats(characterId, userId);
  }

  static async calculateCarryingCapacity(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CarryingCapacity>> {
    return CharacterServiceStats.calculateCarryingCapacity(characterId, userId);
  }

  static async calculateEquipmentWeight(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<EquipmentWeight>> {
    return CharacterServiceStats.calculateEquipmentWeight(characterId, userId);
  }

  static async calculateExperienceInfo(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<ExperienceInfo>> {
    return CharacterServiceStats.calculateExperienceInfo(characterId, userId);
  }

  // ================================
  // Templates and Bulk Operations - Delegate to CharacterServiceTemplates
  // ================================

  static async createCharacterTemplate(
    characterId: string,
    userId: string,
    templateName: string
  ): Promise<ServiceResult<CharacterPreset>> {
    return CharacterServiceTemplates.createCharacterTemplate(characterId, userId, templateName);
  }

  static async cloneCharacter(
    characterId: string,
    userId: string,
    newName: string
  ): Promise<ServiceResult<ICharacter>> {
    return CharacterServiceTemplates.cloneCharacter(characterId, userId, newName);
  }

  static async createCharacterFromTemplate(
    templateData: CharacterPreset,
    ownerId: string,
    customizations?: Partial<CharacterCreation>
  ): Promise<ServiceResult<ICharacter>> {
    return CharacterServiceTemplates.createCharacterFromTemplate(templateData, ownerId, customizations);
  }

  static async createMultipleCharacters(
    ownerId: string,
    charactersData: CharacterCreation[]
  ): Promise<ServiceResult<BulkOperationResult<ICharacter>>> {
    return CharacterServiceTemplates.createMultipleCharacters(ownerId, charactersData);
  }

  static async updateMultipleCharacters(
    userId: string,
    updates: Array<{ characterId: string; data: CharacterUpdate }>
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterServiceTemplates.updateMultipleCharacters(userId, updates);
  }

  static async deleteMultipleCharacters(
    userId: string,
    characterIds: string[]
  ): Promise<ServiceResult<void>> {
    return CharacterServiceTemplates.deleteMultipleCharacters(userId, characterIds);
  }

  // ================================
  // Character Validation and Sanitization
  // ================================

  static async validateCharacterData(
    characterData: any
  ): Promise<ServiceResult<CharacterCreation>> {
    try {
      const validationResult = characterCreationSchema.safeParse(characterData);

      if (!validationResult.success) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterData(validationResult.error.errors)
        );
      }

      // Additional business logic validation
      const totalLevel = validationResult.data.classes.reduce((sum, cls) => sum + cls.level, 0);
      if (totalLevel > 20) {
        return createErrorResult(
          CharacterServiceErrors.invalidCharacterLevel(totalLevel)
        );
      }

      // Sanitize data
      const sanitizedData = {
        ...validationResult.data,
        name: validationResult.data.name.trim(),
        backstory: this.sanitizeText(validationResult.data.backstory || ''),
        notes: this.sanitizeText(validationResult.data.notes || ''),
      };

      return createSuccessResult(sanitizedData);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed('validate character data', error?.message)
      );
    }
  }

  // ================================
  // Character Ownership and Permissions
  // ================================

  static async checkCharacterOwnership(
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

  static async checkCharacterAccess(
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

  static async getCharacterPermissions(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterPermissions>> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(characterId));
      }

      const isOwner = character.ownerId.toString() === userId;
      const canView = isOwner || character.isPublic;

      const permissions: CharacterPermissions = {
        canView,
        canEdit: isOwner,
        canDelete: isOwner,
        canShare: isOwner,
      };

      return createSuccessResult(permissions);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get character permissions', error)
      );
    }
  }

  // ================================
  // Private Helper Methods
  // ================================

  private static sanitizeText(text: string): string {
    // Basic HTML/XSS sanitization
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}

// Re-export types and interfaces for convenience
export type {
  PaginatedCharacters,
  CharacterStats,
  SpellcastingStats,
  CarryingCapacity,
  EquipmentWeight,
  ExperienceInfo,
  BulkOperationResult,
};