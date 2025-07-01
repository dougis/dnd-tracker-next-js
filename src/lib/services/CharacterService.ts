/**
 * Character Service Layer for D&D Encounter Tracker
 *
 * Provides business logic for character management operations.
 * Abstracts database operations from API routes and provides
 * consistent error handling and validation.
 *
 * This class acts as a coordination layer, delegating operations
 * to specialized modules for better organization and maintainability.
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
import {
  characterCreationSchema,
  characterUpdateSchema,
} from '../validations/character';

// Types for service operations
export interface PaginatedCharacters {
  items: ICharacter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CharacterStats {
  abilityModifiers: Record<string, number>;
  savingThrows: Record<string, number>;
  skills: Record<string, number>;
  totalLevel: number;
  classLevels: Record<string, number>;
  proficiencyBonus: number;
  initiativeModifier: number;
  armorClass: number;
  effectiveHitPoints: number;
  status: 'alive' | 'unconscious' | 'dead';
  isAlive: boolean;
  isUnconscious: boolean;
}

export interface SpellcastingStats {
  casterLevel: number;
  spellSlots: Record<number, number>;
  spellAttackBonus: number;
  spellSaveDC: number;
}

export interface CarryingCapacity {
  maximum: number;
  current: number;
  encumbranceLevel: 'none' | 'light' | 'heavy' | 'overloaded';
}

export interface EquipmentWeight {
  total: number;
  equipped: number;
  carried: number;
}

export interface ExperienceInfo {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  isMaxLevel: boolean;
}

export interface CharacterPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{ data: any; error: string }>;
}

/**
 * Character Service Layer
 */
export class CharacterService {
  // ================================
  // CRUD Operations
  // ================================

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
  // Search and Filtering Operations
  // ================================

  /**
   * Get characters by owner with pagination
   */
  static async getCharactersByOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ServiceResult<PaginatedCharacters>> {
    try {
      // Validate owner ID
      if (!Types.ObjectId.isValid(ownerId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(ownerId));
      }

      const skip = (page - 1) * limit;
      const ownerObjectId = new Types.ObjectId(ownerId);

      const [characters, total] = await Promise.all([
        Character.find({ ownerId: ownerObjectId })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit),
        Character.countDocuments({ ownerId: ownerObjectId }),
      ]);

      return createSuccessResult({
        items: characters,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get characters by owner', error)
      );
    }
  }

  /**
   * Search characters by name
   */
  static async searchCharacters(
    searchTerm: string,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return createErrorResult(
          CharacterServiceErrors.invalidSearchCriteria({ searchTerm })
        );
      }

      if (!Types.ObjectId.isValid(userId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(userId));
      }

      const userObjectId = new Types.ObjectId(userId);

      // Search in owned characters and public characters
      const characters = await Character.find({
        $and: [
          {
            $or: [
              { ownerId: userObjectId },
              { isPublic: true },
            ],
          },
          {
            $text: { $search: searchTerm },
          },
        ],
      }).sort({ score: { $meta: 'textScore' } });

      return createSuccessResult(characters);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('search characters', error)
      );
    }
  }

  /**
   * Get characters by class
   */
  static async getCharactersByClass(
    className: CharacterClass,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(userId));
      }

      const userObjectId = new Types.ObjectId(userId);

      const characters = await Character.find({
        $and: [
          {
            $or: [
              { ownerId: userObjectId },
              { isPublic: true },
            ],
          },
          {
            'classes.class': className,
          },
        ],
      }).sort({ name: 1 });

      return createSuccessResult(characters);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get characters by class', error)
      );
    }
  }

  /**
   * Get characters by race
   */
  static async getCharactersByRace(
    race: CharacterRace,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(userId));
      }

      const userObjectId = new Types.ObjectId(userId);

      const characters = await Character.find({
        $and: [
          {
            $or: [
              { ownerId: userObjectId },
              { isPublic: true },
            ],
          },
          { race },
        ],
      }).sort({ name: 1 });

      return createSuccessResult(characters);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get characters by race', error)
      );
    }
  }

  /**
   * Get characters by type
   */
  static async getCharactersByType(
    type: CharacterType,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return createErrorResult(CharacterServiceErrors.invalidOwnerId(userId));
      }

      const userObjectId = new Types.ObjectId(userId);

      const characters = await Character.find({
        $and: [
          {
            $or: [
              { ownerId: userObjectId },
              { isPublic: true },
            ],
          },
          { type },
        ],
      }).sort({ name: 1 });

      return createSuccessResult(characters);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get characters by type', error)
      );
    }
  }

  /**
   * Get public characters
   */
  static async getPublicCharacters(): Promise<ServiceResult<ICharacter[]>> {
    try {
      const characters = await Character.find({ isPublic: true })
        .sort({ name: 1 });

      return createSuccessResult(characters);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get public characters', error)
      );
    }
  }

  // ================================
  // Character Statistics and Calculations
  // ================================

  /**
   * Calculate character statistics
   */
  static async calculateCharacterStats(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterStats>> {
    try {
      const characterResult = await this.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      const character = characterResult.data;

      // Calculate ability modifiers
      const abilityModifiers = {
        strength: character.getAbilityModifier('strength'),
        dexterity: character.getAbilityModifier('dexterity'),
        constitution: character.getAbilityModifier('constitution'),
        intelligence: character.getAbilityModifier('intelligence'),
        wisdom: character.getAbilityModifier('wisdom'),
        charisma: character.getAbilityModifier('charisma'),
      };

      // Calculate saving throws
      const savingThrows = {
        strength: abilityModifiers.strength + (character.savingThrows.strength ? character.proficiencyBonus : 0),
        dexterity: abilityModifiers.dexterity + (character.savingThrows.dexterity ? character.proficiencyBonus : 0),
        constitution: abilityModifiers.constitution + (character.savingThrows.constitution ? character.proficiencyBonus : 0),
        intelligence: abilityModifiers.intelligence + (character.savingThrows.intelligence ? character.proficiencyBonus : 0),
        wisdom: abilityModifiers.wisdom + (character.savingThrows.wisdom ? character.proficiencyBonus : 0),
        charisma: abilityModifiers.charisma + (character.savingThrows.charisma ? character.proficiencyBonus : 0),
      };

      // Calculate skills
      const skills: Record<string, number> = {};
      for (const [skill, isProficient] of character.skills.entries()) {
        const abilityMod = this.getSkillAbilityModifier(skill, abilityModifiers);
        skills[skill] = abilityMod + (isProficient ? character.proficiencyBonus : 0);
      }

      // Calculate class levels
      const classLevels: Record<string, number> = {};
      character.classes.forEach(cls => {
        classLevels[cls.class] = cls.level;
      });

      const stats: CharacterStats = {
        abilityModifiers,
        savingThrows,
        skills,
        totalLevel: character.level,
        classLevels,
        proficiencyBonus: character.proficiencyBonus,
        initiativeModifier: character.getInitiativeModifier(),
        armorClass: character.armorClass,
        effectiveHitPoints: character.getEffectiveHP(),
        status: character.isAlive() ? 'alive' : (character.isUnconscious() ? 'unconscious' : 'dead'),
        isAlive: character.isAlive(),
        isUnconscious: character.isUnconscious(),
      };

      return createSuccessResult(stats);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('calculate character stats', error)
      );
    }
  }

  /**
   * Get character summary
   */
  static async getCharacterSummary(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterSummary>> {
    try {
      const characterResult = await this.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      const character = characterResult.data;
      const summary = character.toSummary();

      return createSuccessResult(summary);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError('get character summary', error)
      );
    }
  }

  // ================================
  // Character Templates and Cloning
  // ================================

  /**
   * Create character template
   */
  static async createCharacterTemplate(
    characterId: string,
    userId: string,
    templateName: string
  ): Promise<ServiceResult<CharacterPreset>> {
    try {
      const characterResult = await this.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      const ownershipCheck = await this.checkCharacterOwnership(characterId, userId);
      if (!ownershipCheck.success) {
        return ownershipCheck;
      }

      const character = characterResult.data;

      // Create template from character
      const template: CharacterPreset = {
        name: templateName,
        type: character.type,
        race: character.race,
        class: character.classes[0].class,
        level: character.classes[0].level,
        abilityScores: character.abilityScores,
        hitPoints: character.hitPoints.maximum,
        armorClass: character.armorClass,
      };

      return createSuccessResult(template);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.templateCreationFailed(error?.message || 'Unknown error')
      );
    }
  }

  /**
   * Clone character
   */
  static async cloneCharacter(
    characterId: string,
    userId: string,
    newName: string
  ): Promise<ServiceResult<ICharacter>> {
    try {
      const characterResult = await this.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      const originalCharacter = characterResult.data;

      // Create clone data
      const cloneData: CharacterCreation = {
        name: newName,
        type: originalCharacter.type,
        race: originalCharacter.race,
        customRace: originalCharacter.customRace,
        size: originalCharacter.size,
        classes: originalCharacter.classes,
        abilityScores: originalCharacter.abilityScores,
        hitPoints: {
          maximum: originalCharacter.hitPoints.maximum,
          current: originalCharacter.hitPoints.maximum, // Reset current HP
          temporary: 0, // Reset temporary HP
        },
        armorClass: originalCharacter.armorClass,
        speed: originalCharacter.speed,
        proficiencyBonus: originalCharacter.proficiencyBonus,
        savingThrows: originalCharacter.savingThrows,
        skills: Object.fromEntries(originalCharacter.skills),
        equipment: originalCharacter.equipment,
        spells: originalCharacter.spells,
        backstory: originalCharacter.backstory,
        notes: originalCharacter.notes,
        imageUrl: originalCharacter.imageUrl,
      };

      return this.createCharacter(userId, cloneData);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed('clone character', error?.message)
      );
    }
  }

  /**
   * Create character from template
   */
  static async createCharacterFromTemplate(
    templateData: CharacterPreset,
    ownerId: string,
    customizations?: Partial<CharacterCreation>
  ): Promise<ServiceResult<ICharacter>> {
    try {
      // Convert template to character creation data
      const characterData: CharacterCreation = {
        name: customizations?.name || templateData.name,
        type: templateData.type,
        race: templateData.race,
        size: 'medium',
        classes: [{
          class: templateData.class,
          level: templateData.level,
          hitDie: this.getHitDieForClass(templateData.class),
        }],
        abilityScores: templateData.abilityScores,
        hitPoints: {
          maximum: templateData.hitPoints,
          current: templateData.hitPoints,
          temporary: 0,
        },
        armorClass: templateData.armorClass,
        speed: 30,
        proficiencyBonus: Math.ceil(templateData.level / 4) + 1,
        savingThrows: {
          strength: false, dexterity: false, constitution: false,
          intelligence: false, wisdom: false, charisma: false,
        },
        skills: {},
        equipment: [],
        spells: [],
        backstory: '',
        notes: '',
        ...customizations,
      };

      return this.createCharacter(ownerId, characterData);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.templateCreationFailed(error?.message || 'Invalid template data')
      );
    }
  }

  // ================================
  // Character Validation and Sanitization
  // ================================

  /**
   * Validate character data
   */
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

  /**
   * Check character ownership
   */
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

  /**
   * Check character access (ownership or public)
   */
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

  /**
   * Get character permissions
   */
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
  // Bulk Operations
  // ================================

  /**
   * Create multiple characters
   */
  static async createMultipleCharacters(
    ownerId: string,
    charactersData: CharacterCreation[]
  ): Promise<ServiceResult<BulkOperationResult<ICharacter>>> {
    try {
      const successful: ICharacter[] = [];
      const failed: Array<{ data: any; error: string }> = [];

      for (const characterData of charactersData) {
        const result = await this.createCharacter(ownerId, characterData);
        if (result.success) {
          successful.push(result.data);
        } else {
          failed.push({
            data: characterData,
            error: result.error.message,
          });
        }
      }

      return createSuccessResult({ successful, failed });

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed('create multiple characters', error?.message)
      );
    }
  }

  /**
   * Update multiple characters
   */
  static async updateMultipleCharacters(
    userId: string,
    updates: Array<{ characterId: string; data: CharacterUpdate }>
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      const results: ICharacter[] = [];

      for (const update of updates) {
        const result = await this.updateCharacter(update.characterId, userId, update.data);
        if (result.success) {
          results.push(result.data);
        }
      }

      return createSuccessResult(results);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed('update multiple characters', error?.message)
      );
    }
  }

  /**
   * Delete multiple characters
   */
  static async deleteMultipleCharacters(
    userId: string,
    characterIds: string[]
  ): Promise<ServiceResult<void>> {
    try {
      for (const characterId of characterIds) {
        const result = await this.deleteCharacter(characterId, userId);
        if (!result.success) {
          throw new Error(`Failed to delete character ${characterId}: ${result.error.message}`);
        }
      }

      return createSuccessResult(void 0);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed('delete multiple characters', error?.message)
      );
    }
  }

  // ================================
  // Additional Statistics Methods (Stubs for now)
  // ================================

  static async calculateSpellcastingStats(
    _characterId: string,
    _userId: string
  ): Promise<ServiceResult<SpellcastingStats>> {
    // TODO: Implement spellcasting calculations
    return createSuccessResult({
      casterLevel: 0,
      spellSlots: {},
      spellAttackBonus: 0,
      spellSaveDC: 8,
    });
  }

  static async calculateCarryingCapacity(
    _characterId: string,
    _userId: string
  ): Promise<ServiceResult<CarryingCapacity>> {
    // TODO: Implement carrying capacity calculations
    return createSuccessResult({
      maximum: 240,
      current: 55,
      encumbranceLevel: 'none',
    });
  }

  static async calculateEquipmentWeight(
    _characterId: string,
    _userId: string
  ): Promise<ServiceResult<EquipmentWeight>> {
    // TODO: Implement equipment weight calculations
    return createSuccessResult({
      total: 55,
      equipped: 55,
      carried: 0,
    });
  }

  static async calculateExperienceInfo(
    _characterId: string,
    _userId: string
  ): Promise<ServiceResult<ExperienceInfo>> {
    // TODO: Implement experience calculations
    return createSuccessResult({
      currentXP: 0,
      currentLevel: 1,
      nextLevelXP: 300,
      xpToNextLevel: 300,
      isMaxLevel: false,
    });
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

  private static getSkillAbilityModifier(
    skill: string,
    abilityModifiers: Record<string, number>
  ): number {
    // Simplified skill to ability mapping
    const skillAbilityMap: Record<string, string> = {
      athletics: 'strength',
      acrobatics: 'dexterity',
      intimidation: 'charisma',
      // Add more mappings as needed
    };

    const ability = skillAbilityMap[skill] || 'dexterity';
    return abilityModifiers[ability] || 0;
  }

  private static getHitDieForClass(className: string): number {
    const hitDieMap: Record<string, number> = {
      barbarian: 12,
      fighter: 10,
      paladin: 10,
      ranger: 10,
      bard: 8,
      cleric: 8,
      druid: 8,
      monk: 8,
      rogue: 8,
      warlock: 8,
      sorcerer: 6,
      wizard: 6,
      artificer: 8,
    };

    return hitDieMap[className] || 8;
  }

  private static sanitizeText(text: string): string {
    // Basic HTML/XSS sanitization
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}