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
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from './CharacterServiceErrors';
import { CharacterServiceCRUD } from './CharacterServiceCRUD';

export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{ data: any; error: string }>;
}

export class CharacterServiceTemplates {

  /**
   * Create character template
   */
  static async createCharacterTemplate(
    characterId: string,
    userId: string,
    templateName: string
  ): Promise<ServiceResult<CharacterPreset>> {
    try {
      const characterResult = await CharacterServiceCRUD.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      const character = characterResult.data;

      // Create template from character
      const template: CharacterPreset = {
        name: templateName,
        type: character.type as CharacterType,
        race: character.race as CharacterRace,
        class: character.classes[0].class as CharacterClass,
        level: character.classes[0].level,
        abilityScores: character.abilityScores,
        hitPoints: character.hitPoints.maximum,
        armorClass: character.armorClass,
      };

      return createSuccessResult(template);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.templateCreationFailed(
          error instanceof Error ? error.message : 'Unknown error'
        )
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
      const characterResult = await CharacterServiceCRUD.getCharacterById(characterId, userId);
      if (!characterResult.success) {
        return characterResult;
      }

      const originalCharacter = characterResult.data;

      // Create clone data
      const cloneData: CharacterCreation = {
        name: newName,
        type: originalCharacter.type as CharacterType,
        race: originalCharacter.race as CharacterRace,
        customRace: originalCharacter.customRace,
        size: originalCharacter.size as Size,
        classes: originalCharacter.classes.map(c => ({
          class: c.class as CharacterClass,
          level: c.level,
          hitDie: c.hitDie,
          subclass: c.subclass,
        })),
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
        spells: originalCharacter.spells.map(spell => ({
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
        })),
        backstory: originalCharacter.backstory,
        notes: originalCharacter.notes,
        imageUrl: originalCharacter.imageUrl,
      };

      return CharacterServiceCRUD.createCharacter(userId, cloneData);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed(
          'clone character',
          error instanceof Error ? error.message : 'Unknown error'
        )
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
        const result = await CharacterServiceCRUD.createCharacter(ownerId, characterData);
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
        CharacterServiceErrors.operationFailed(
          'create multiple characters',
          error instanceof Error ? error.message : 'Unknown error'
        )
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
        const result = await CharacterServiceCRUD.updateCharacter(update.characterId, userId, update.data);
        if (result.success) {
          results.push(result.data);
        }
      }

      return createSuccessResult(results);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed(
          'update multiple characters',
          error instanceof Error ? error.message : 'Unknown error'
        )
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
        const result = await CharacterServiceCRUD.deleteCharacter(characterId, userId);
        if (!result.success) {
          throw new Error(`Failed to delete character ${characterId}: ${result.error.message}`);
        }
      }

      return createSuccessResult(void 0);

    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.operationFailed(
          'delete multiple characters',
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  }

  // ================================
  // Private Helper Methods
  // ================================

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