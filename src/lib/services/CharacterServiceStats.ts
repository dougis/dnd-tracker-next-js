/**
 * Character Service Statistics and Calculations
 *
 * Handles character statistics, ability calculations, and derived values.
 * Separated from main service to maintain file size under 500 lines.
 */

import type { CharacterSummary } from '../validations/character';
import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from './CharacterServiceErrors';
import { CharacterServiceCRUD } from './CharacterServiceCRUD';

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

export class CharacterServiceStats {

  /**
   * Calculate character statistics
   */
  static async calculateCharacterStats(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterStats>> {
    try {
      const characterResult = await CharacterServiceCRUD.getCharacterById(characterId, userId);
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
      for (const [skill, isProficient] of Array.from(character.skills.entries())) {
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
      const characterResult = await CharacterServiceCRUD.getCharacterById(characterId, userId);
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

  /**
   * Calculate spellcasting statistics (stub for now)
   */
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

  /**
   * Calculate carrying capacity (stub for now)
   */
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

  /**
   * Calculate equipment weight (stub for now)
   */
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

  /**
   * Calculate experience information (stub for now)
   */
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
}