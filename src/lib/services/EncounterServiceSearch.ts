import { Types } from 'mongoose';
import { Encounter } from '@/lib/models/encounter';
import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  InvalidEncounterIdError,
} from './EncounterServiceErrors';
import { EncounterServiceValidation } from './EncounterServiceValidation';

/**
 * Encounter Service - Search and Filtering Module
 *
 * Handles encounter search functionality including filtering by various
 * criteria and retrieving encounters by ownership and permissions.
 */
export class EncounterServiceSearch {

  /**
   * Search encounters with various filters
   */
  static async searchEncounters(criteria: {
    query?: string;
    name?: string;
    difficulty?: string | string[];
    targetLevel?: number;
    targetLevelMin?: number;
    targetLevelMax?: number;
    status?: string | string[];
    tags?: string[];
    ownerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{
    encounters: IEncounter[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>> {
    try {
      const {
        query,
        name,
        difficulty,
        targetLevel,
        targetLevelMin,
        targetLevelMax,
        status,
        tags,
        ownerId,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = criteria;

      // Build MongoDB query
      const mongoQuery: any = {};

      if (query || name) {
        mongoQuery.name = { $regex: query || name, $options: 'i' };
      }

      if (difficulty) {
        if (Array.isArray(difficulty) && difficulty.length > 0) {
          mongoQuery.difficulty = { $in: difficulty };
        } else if (typeof difficulty === 'string') {
          mongoQuery.difficulty = difficulty;
        }
      }

      if (targetLevel) {
        mongoQuery.targetLevel = targetLevel;
      } else if (targetLevelMin !== undefined || targetLevelMax !== undefined) {
        mongoQuery.targetLevel = {};
        if (targetLevelMin !== undefined) {
          mongoQuery.targetLevel.$gte = targetLevelMin;
        }
        if (targetLevelMax !== undefined) {
          mongoQuery.targetLevel.$lte = targetLevelMax;
        }
      }

      if (status) {
        if (Array.isArray(status) && status.length > 0) {
          mongoQuery.status = { $in: status };
        } else if (typeof status === 'string') {
          mongoQuery.status = status;
        }
      }

      if (tags && Array.isArray(tags) && tags.length > 0) {
        mongoQuery.tags = { $in: tags };
      }

      if (ownerId) {
        mongoQuery.ownerId = ownerId;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOption: any = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [encounters, totalItems] = await Promise.all([
        Encounter.find(mongoQuery)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .exec(),
        Encounter.countDocuments(mongoQuery),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          encounters,
          currentPage: page,
          totalPages,
          totalItems,
        },
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to search encounters',
        'ENCOUNTER_SEARCH_FAILED'
      );
    }
  }

  /**
   * Get encounters by owner
   */
  static async getEncountersByOwner(
    ownerId: string,
    includeShared: boolean = false
  ): Promise<ServiceResult<IEncounter[]>> {
    try {
      if (!EncounterServiceValidation.isValidObjectId(ownerId)) {
        throw new InvalidEncounterIdError(ownerId);
      }

      const encounters = await Encounter.findByOwnerId(
        new Types.ObjectId(ownerId),
        includeShared
      );

      return {
        success: true,
        data: encounters,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to get encounters by owner',
        'ENCOUNTERS_BY_OWNER_FAILED'
      );
    }
  }
}