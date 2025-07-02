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
    name?: string;
    difficulty?: string;
    targetLevel?: number;
    status?: string;
    ownerId?: string;
  }): Promise<ServiceResult<IEncounter[]>> {
    try {
      let encounters: IEncounter[] = [];

      if (criteria.name) {
        encounters = await Encounter.searchByName(criteria.name);
      } else if (criteria.difficulty) {
        encounters = await Encounter.findByDifficulty(criteria.difficulty as any);
      } else if (criteria.targetLevel) {
        encounters = await Encounter.findByTargetLevel(criteria.targetLevel);
      } else if (criteria.status) {
        encounters = await Encounter.findByStatus(criteria.status as any);
      } else {
        encounters = await Encounter.find({});
      }

      return {
        success: true,
        data: encounters,
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