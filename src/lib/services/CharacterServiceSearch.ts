/**
 * Character Service Search Operations
 *
 * Handles search, filtering, and pagination operations for characters.
 * Separated from main service to maintain file size under 500 lines.
 * Refactored to use utility modules to eliminate code duplication.
 */

import type { ICharacter } from '../models/Character';
import type {
  CharacterClass,
  CharacterRace,
  CharacterType,
} from '../validations/character';
import {
  ServiceResult,
} from './CharacterServiceErrors';
import { CharacterQueryUtils } from './utils/CharacterQueryUtils';

export interface PaginatedCharacters {
  items: ICharacter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CharacterServiceSearch {

  /**
   * Get characters by owner with pagination
   */
  static async getCharactersByOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ServiceResult<PaginatedCharacters>> {
    return CharacterQueryUtils.findByOwner(ownerId, page, limit);
  }

  /**
   * Search characters by name
   */
  static async searchCharacters(
    searchTerm: string,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterQueryUtils.searchCharacters(searchTerm, userId);
  }

  /**
   * Get characters by class
   */
  static async getCharactersByClass(
    className: CharacterClass,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterQueryUtils.findByClass(className, userId);
  }

  /**
   * Get characters by race
   */
  static async getCharactersByRace(
    race: CharacterRace,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterQueryUtils.findByRace(race, userId);
  }

  /**
   * Get characters by type
   */
  static async getCharactersByType(
    type: CharacterType,
    userId: string
  ): Promise<ServiceResult<ICharacter[]>> {
    return CharacterQueryUtils.findByType(type, userId);
  }

  /**
   * Get public characters
   */
  static async getPublicCharacters(): Promise<ServiceResult<ICharacter[]>> {
    return CharacterQueryUtils.findPublicCharacters();
  }
}