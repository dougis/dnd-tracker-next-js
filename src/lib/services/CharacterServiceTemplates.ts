/**
 * Character Service Templates and Cloning Operations
 *
 * Handles character template creation, cloning, and bulk operations.
 * Separated from main service to maintain file size under 500 lines.
 */

import type {
  CharacterCreation,
  CharacterUpdate,
  CharacterPreset,
  CharacterRace,
  CharacterClass,
  CharacterType,
  Size,
} from '../validations/character';
import type { ICharacter } from '../models/Character';
import {
  ServiceResult,
  createErrorResult,
  CharacterServiceErrors,
} from './CharacterServiceErrors';
import { CharacterServiceCRUD } from './CharacterServiceCRUD';
import { OperationWrapper } from './utils/OperationWrapper';

export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{ data: any; error: string }>;
}

export class CharacterServiceTemplates {

  // ================================
  // Private Helper Methods (moved to top for shared use)
  // ================================

  /**
   * Shared helper to get validated character - eliminates duplication
   */
  private static async getValidatedCharacter(characterId: string, userId: string): Promise<ICharacter> {
    const characterResult = await CharacterServiceCRUD.getCharacterById(characterId, userId);
    if (!characterResult.success) {
      throw new Error(characterResult.error.message);
    }
    return characterResult.data;
  }

  /**
   * Execute character operation with standard error handling - eliminates duplication
   */
  private static async executeCharacterOperation<T>(
    characterId: string,
    userId: string,
    operation: (_character: ICharacter) => Promise<T>,
    errorType: string
  ): Promise<ServiceResult<T>> {
    return OperationWrapper.executeWithCustomError(
      async () => {
        const character = await this.getValidatedCharacter(characterId, userId);
        return await operation(character);
      },
      (error) => CharacterServiceErrors.operationFailed(
        errorType,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }

  /**
   * Execute character operation with template-specific error handling
   */
  private static async executeTemplateOperation<T>(
    characterId: string,
    userId: string,
    operation: (_character: ICharacter) => T,
    _errorType: string = 'template operation'
  ): Promise<ServiceResult<T>> {
    return OperationWrapper.executeWithCustomError(
      async () => {
        const character = await this.getValidatedCharacter(characterId, userId);
        return operation(character);
      },
      (error) => CharacterServiceErrors.templateCreationFailed(
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }

  /**
   * Create character template
   */
  static async createCharacterTemplate(
    characterId: string,
    userId: string,
    templateName: string
  ): Promise<ServiceResult<CharacterPreset>> {
    return this.executeTemplateOperation(
      characterId,
      userId,
      (character) => this.createTemplateFromCharacter(character, templateName),
      'create character template'
    );
  }

  /**
   * Clone character
   */
  static async cloneCharacter(
    characterId: string,
    userId: string,
    newName: string
  ): Promise<ServiceResult<ICharacter>> {
    return this.executeCharacterOperation(
      characterId,
      userId,
      async (originalCharacter) => {
        const cloneData = this.createCloneDataFromCharacter(originalCharacter, newName);

        const createResult = await CharacterServiceCRUD.createCharacter(userId, cloneData);
        if (!createResult.success) {
          throw new Error(createResult.error.message);
        }

        return createResult.data;
      },
      'clone character'
    );
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

      return CharacterServiceCRUD.createCharacter(ownerId, characterData);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.templateCreationFailed(
          error instanceof Error ? error.message : 'Invalid template data'
        )
      );
    }
  }

  /**
   * Generic bulk operation processor - eliminates duplication
   */
  private static async processBulkOperation<T, R>(
    items: T[],
    operation: (_item: T) => Promise<ServiceResult<R>>,
    _operationName: string
  ): Promise<BulkOperationResult<R>> {
    const successful: R[] = [];
    const failed: Array<{ data: T; error: string }> = [];

    for (const item of items) {
      const result = await operation(item);
      if (result.success) {
        successful.push(result.data);
      } else {
        failed.push({
          data: item,
          error: result.error.message,
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Create multiple characters
   */
  static async createMultipleCharacters(
    ownerId: string,
    charactersData: CharacterCreation[]
  ): Promise<ServiceResult<BulkOperationResult<ICharacter>>> {
    return OperationWrapper.execute(
      () => this.processBulkOperation(
        charactersData,
        (data) => CharacterServiceCRUD.createCharacter(ownerId, data),
        'create multiple characters'
      ),
      'create multiple characters'
    );
  }

  /**
   * Update multiple characters
   */
  static async updateMultipleCharacters(
    userId: string,
    updates: Array<{ characterId: string; data: CharacterUpdate }>
  ): Promise<ServiceResult<ICharacter[]>> {
    return OperationWrapper.execute(
      async () => {
        const results: ICharacter[] = [];

        for (const update of updates) {
          const result = await CharacterServiceCRUD.updateCharacter(update.characterId, userId, update.data);
          if (result.success) {
            results.push(result.data);
          }
        }

        return results;
      },
      'update multiple characters'
    );
  }

  /**
   * Delete multiple characters
   */
  static async deleteMultipleCharacters(
    userId: string,
    characterIds: string[]
  ): Promise<ServiceResult<void>> {
    return OperationWrapper.execute(
      async () => {
        for (const characterId of characterIds) {
          const result = await CharacterServiceCRUD.deleteCharacter(characterId, userId);
          if (!result.success) {
            throw new Error(`Failed to delete character ${characterId}: ${result.error.message}`);
          }
        }
        return void 0;
      },
      'delete multiple characters'
    );
  }

  // ================================
  // Private Helper Methods
  // ================================

  private static createTemplateFromCharacter(
    character: ICharacter,
    templateName: string
  ): CharacterPreset {
    return {
      name: templateName,
      type: character.type as CharacterType,
      race: character.race as CharacterRace,
      class: character.classes[0].class as CharacterClass,
      level: character.classes[0].level,
      abilityScores: character.abilityScores,
      hitPoints: character.hitPoints.maximum,
      armorClass: character.armorClass,
    };
  }

  private static createCloneDataFromCharacter(
    originalCharacter: ICharacter,
    newName: string
  ): CharacterCreation {
    return {
      name: newName,
      type: originalCharacter.type as CharacterType,
      race: originalCharacter.race as CharacterRace,
      customRace: originalCharacter.customRace,
      size: originalCharacter.size as Size,
      classes: this.cloneClasses(originalCharacter.classes),
      abilityScores: originalCharacter.abilityScores,
      hitPoints: this.resetHitPoints(originalCharacter.hitPoints),
      armorClass: originalCharacter.armorClass,
      speed: originalCharacter.speed,
      proficiencyBonus: originalCharacter.proficiencyBonus,
      savingThrows: originalCharacter.savingThrows,
      skills: Object.fromEntries(originalCharacter.skills),
      equipment: originalCharacter.equipment,
      spells: this.cloneSpells(originalCharacter.spells),
      backstory: originalCharacter.backstory,
      notes: originalCharacter.notes,
      imageUrl: originalCharacter.imageUrl,
    };
  }

  private static cloneClasses(classes: any[]): any[] {
    return classes.map(c => ({
      class: c.class as CharacterClass,
      level: c.level,
      hitDie: c.hitDie,
      subclass: c.subclass,
    }));
  }

  private static resetHitPoints(hitPoints: any): any {
    return {
      maximum: hitPoints.maximum,
      current: hitPoints.maximum, // Reset current HP
      temporary: 0, // Reset temporary HP
    };
  }

  private static cloneSpells(spells: any[]): any[] {
    return spells.map(spell => ({
      name: spell.name,
      level: spell.level,
      school: spell.school as 'abjuration' | 'conjuration' | 'divination' | 'enchantment' | 'evocation' | 'illusion' | 'necromancy' | 'transmutation',
      castingTime: spell.castingTime,
      range: spell.range,
      components: {
        verbal: false,
        somatic: false,
        material: false,
        materialComponent: spell.components,
      },
      duration: spell.duration,
      description: spell.description,
      prepared: spell.isPrepared,
    }));
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
}