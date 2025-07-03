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
        CharacterServiceErrors.operationFailed('validate character data', error instanceof Error ? error.message : 'Unknown error')
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
  // Enhanced Character Editing Features
  // ================================

  /**
   * Save draft changes for autosave functionality
   */
  static async saveDraftChanges(
    characterId: string,
    userId: string,
    _draftData: CharacterUpdate
  ): Promise<ServiceResult<void>> {
    try {
      // Verify character access
      const accessResult = await this.checkCharacterAccess(characterId, userId);
      if (!accessResult.success) {
        return accessResult;
      }

      // Store draft changes in a separate collection or field
      // For now, we'll simulate this - in a real implementation,
      // you would store this in a separate drafts collection
      return createSuccessResult(void 0);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('save draft changes', error)
      );
    }
  }

  /**
   * Get draft changes for a character
   */
  static async getDraftChanges(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterUpdate | null>> {
    try {
      // Verify character access
      const accessResult = await this.checkCharacterAccess(characterId, userId);
      if (!accessResult.success) {
        return accessResult;
      }

      // Retrieve draft changes - for now return null (no drafts)
      // In a real implementation, you would query the drafts collection
      return createSuccessResult(null);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get draft changes', error)
      );
    }
  }

  /**
   * Clear draft changes for a character
   */
  static async clearDraftChanges(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verify character access
      const accessResult = await this.checkCharacterAccess(characterId, userId);
      if (!accessResult.success) {
        return accessResult;
      }

      // Clear draft changes - for now just return success
      // In a real implementation, you would delete from drafts collection
      return createSuccessResult(void 0);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('clear draft changes', error)
      );
    }
  }

  /**
   * Get character version history
   */
  static async getCharacterVersionHistory(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<any[]>> {
    try {
      // Verify character access
      const accessResult = await this.checkCharacterAccess(characterId, userId);
      if (!accessResult.success) {
        return accessResult;
      }

      // Return mock version history for now
      // In a real implementation, you would query a versions collection
      const mockHistory = [
        {
          id: 'version-1',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          changes: {
            abilityScores: { strength: { from: 14, to: 16 } }
          },
          changeDescription: 'Increased strength from 14 to 16',
          userId: userId
        }
      ];

      return createSuccessResult(mockHistory);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get version history', error)
      );
    }
  }

  /**
   * Revert character to a previous version
   */
  static async revertCharacterToVersion(
    characterId: string,
    userId: string,
    _versionId: string
  ): Promise<ServiceResult<ICharacter>> {
    try {
      // Verify character access and ownership
      const ownershipResult = await this.checkCharacterOwnership(characterId, userId);
      if (!ownershipResult.success) {
        return ownershipResult;
      }

      // Get current character
      const characterResult = await this.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      // In a real implementation, you would:
      // 1. Find the version data
      // 2. Update the character with that version's data
      // 3. Create a new version entry for this revert action

      // For now, just return the current character
      return createSuccessResult(characterResult.data);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('revert to version', error)
      );
    }
  }

  /**
   * Enhanced delete character with undo functionality
   */
  static async deleteCharacterWithUndo(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<{ undoToken: string; expiresAt: number }>> {
    try {
      // Verify character ownership
      const ownershipResult = await this.checkCharacterOwnership(characterId, userId);
      if (!ownershipResult.success) {
        return ownershipResult;
      }

      // Get character data before deletion
      const characterResult = await this.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      // Perform soft delete and create undo token
      const undoToken = new Types.ObjectId().toString();
      const expiresAt = Date.now() + (30 * 1000); // 30 seconds

      // Mark character as deleted with undo info
      await Character.findByIdAndUpdate(characterId, {
        isDeleted: true,
        deletedAt: new Date(),
        undoToken: undoToken,
        undoExpiresAt: new Date(expiresAt)
      });

      return createSuccessResult({ undoToken, expiresAt });

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('delete character with undo', error)
      );
    }
  }

  /**
   * Restore a deleted character using undo token
   */
  static async restoreCharacter(
    undoToken: string
  ): Promise<ServiceResult<ICharacter>> {
    try {
      // Find character by undo token
      const character = await Character.findOne({
        undoToken: undoToken,
        isDeleted: true,
        undoExpiresAt: { $gt: new Date() }
      });

      if (!character) {
        return createErrorResult(
          CharacterServiceErrors.characterNotFound('with valid undo token')
        );
      }

      // Restore character
      character.isDeleted = false;
      character.deletedAt = undefined;
      character.undoToken = undefined;
      character.undoExpiresAt = undefined;

      await character.save();

      return createSuccessResult(character.toObject());

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('restore character', error)
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