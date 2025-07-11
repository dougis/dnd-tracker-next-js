/**
 * Character Service Statistics and Calculations
 *
 * Handles character statistics, ability calculations, and derived values.
 * Separated from main service to maintain file size under 500 lines.
 */

import type { CharacterSummary } from '../validations/character';
import type { ICharacter } from '../models/Character';
import {
  ServiceResult,
  createSuccessResult,
} from './CharacterServiceErrors';
import { CharacterServiceCRUD } from './CharacterServiceCRUD';
import { OperationWrapper } from './utils/OperationWrapper';

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
   * Generic character operation wrapper - eliminates OperationWrapper duplication
   */
  private static async executeWithCharacter<T>(
    characterId: string,
    userId: string,
    operation: (_character: ICharacter) => T,
    operationName: string
  ): Promise<ServiceResult<T>> {
    return OperationWrapper.execute(
      async () => {
        const character = await this.getValidatedCharacter(characterId, userId);
        return operation(character);
      },
      operationName
    );
  }

  /**
   * Calculate character statistics
   */
  static async calculateCharacterStats(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterStats>> {
    return this.executeWithCharacter(
      characterId,
      userId,
      (character) => ({
        abilityModifiers: this.calculateAbilityModifiers(character),
        savingThrows: this.calculateSavingThrows(character),
        skills: this.calculateSkills(character),
        totalLevel: character.level,
        classLevels: this.calculateClassLevels(character),
        proficiencyBonus: character.proficiencyBonus,
        initiativeModifier: character.getInitiativeModifier(),
        armorClass: character.armorClass,
        effectiveHitPoints: character.getEffectiveHP(),
        status: this.getCharacterStatus(character),
        isAlive: character.isAlive(),
        isUnconscious: character.isUnconscious(),
      }),
      'calculate character stats'
    );
  }

  /**
   * Get character summary
   */
  static async getCharacterSummary(
    characterId: string,
    userId: string
  ): Promise<ServiceResult<CharacterSummary>> {
    return this.executeWithCharacter(
      characterId,
      userId,
      (character) => character.toSummary(),
      'get character summary'
    );
  }

  /**
   * Shared stub method helper - eliminates stub duplication
   */
  private static createStubResult<T>(defaultValue: T): Promise<ServiceResult<T>> {
    return Promise.resolve(createSuccessResult(defaultValue));
  }

  /**
   * Generic stub method creator - eliminates parameter duplication
   */
  private static createStubMethod<T>(defaultValue: T) {
    return async (_characterId: string, _userId: string): Promise<ServiceResult<T>> => {
      return this.createStubResult(defaultValue);
    };
  }

  /**
   * Calculate spellcasting statistics (stub for now)
   */
  static calculateSpellcastingStats = this.createStubMethod<SpellcastingStats>({
    casterLevel: 0,
    spellSlots: {},
    spellAttackBonus: 0,
    spellSaveDC: 8,
  });

  /**
   * Calculate carrying capacity (stub for now)
   */
  static calculateCarryingCapacity = this.createStubMethod<CarryingCapacity>({
    maximum: 240,
    current: 55,
    encumbranceLevel: 'none' as const,
  });

  /**
   * Calculate equipment weight (stub for now)
   */
  static calculateEquipmentWeight = this.createStubMethod<EquipmentWeight>({
    total: 55,
    equipped: 55,
    carried: 0,
  });

  /**
   * Calculate experience information (stub for now)
   */
  static calculateExperienceInfo = this.createStubMethod<ExperienceInfo>({
    currentXP: 0,
    currentLevel: 1,
    nextLevelXP: 300,
    xpToNextLevel: 300,
    isMaxLevel: false,
  });

  // ================================
  // Private Helper Methods
  // ================================

  private static calculateAbilityModifiers(character: ICharacter): Record<string, number> {
    return {
      strength: character.getAbilityModifier('strength'),
      dexterity: character.getAbilityModifier('dexterity'),
      constitution: character.getAbilityModifier('constitution'),
      intelligence: character.getAbilityModifier('intelligence'),
      wisdom: character.getAbilityModifier('wisdom'),
      charisma: character.getAbilityModifier('charisma'),
    };
  }

  private static calculateSavingThrows(character: ICharacter): Record<string, number> {
    const abilityModifiers = this.calculateAbilityModifiers(character);

    return {
      strength: abilityModifiers.strength + (character.savingThrows.strength ? character.proficiencyBonus : 0),
      dexterity: abilityModifiers.dexterity + (character.savingThrows.dexterity ? character.proficiencyBonus : 0),
      constitution: abilityModifiers.constitution + (character.savingThrows.constitution ? character.proficiencyBonus : 0),
      intelligence: abilityModifiers.intelligence + (character.savingThrows.intelligence ? character.proficiencyBonus : 0),
      wisdom: abilityModifiers.wisdom + (character.savingThrows.wisdom ? character.proficiencyBonus : 0),
      charisma: abilityModifiers.charisma + (character.savingThrows.charisma ? character.proficiencyBonus : 0),
    };
  }

  private static calculateSkills(character: ICharacter): Record<string, number> {
    const abilityModifiers = this.calculateAbilityModifiers(character);
    const skills: Record<string, number> = {};

    for (const [skill, isProficient] of Array.from(character.skills.entries())) {
      const abilityMod = this.getSkillAbilityModifier(skill, abilityModifiers);
      skills[skill] = abilityMod + (isProficient ? character.proficiencyBonus : 0);
    }

    return skills;
  }

  private static calculateClassLevels(character: ICharacter): Record<string, number> {
    const classLevels: Record<string, number> = {};
    character.classes.forEach(cls => {
      classLevels[cls.class] = cls.level;
    });
    return classLevels;
  }

  private static getCharacterStatus(character: ICharacter): 'alive' | 'unconscious' | 'dead' {
    if (character.isAlive()) return 'alive';
    if (character.isUnconscious()) return 'unconscious';
    return 'dead';
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
}