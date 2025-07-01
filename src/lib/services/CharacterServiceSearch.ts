/**
 * Character Service Search Operations
 *
 * Handles search, filtering, and pagination operations for characters.
 * Separated from main service to maintain file size under 500 lines.
 */

import { Types } from 'mongoose';
import { Character, type ICharacter } from '../models/Character';
import type {
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
}