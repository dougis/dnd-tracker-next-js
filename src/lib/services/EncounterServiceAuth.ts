import { Types } from 'mongoose';
import { Encounter } from '@/lib/models/encounter';
import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  EncounterNotFoundError,
  EncounterValidationError,
} from './EncounterServiceErrors';
import { EncounterServiceValidation } from './EncounterServiceValidation';

/**
 * Encounter Service - Authentication and Permissions Module
 *
 * Handles encounter ownership verification, permission checks,
 * and encounter sharing functionality for access control.
 */
export class EncounterServiceAuth {

  /**
   * Check if user owns the encounter
   */
  static async checkOwnership(
    encounterId: string,
    userId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      const isOwner = encounter.ownerId.toString() === userId;

      return {
        success: true,
        data: isOwner,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to check ownership',
        'OWNERSHIP_CHECK_FAILED'
      );
    }
  }

  /**
   * Share encounter with users
   */
  static async shareEncounter(
    encounterId: string,
    userIds: string[]
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      // Validate all user IDs
      const validUserIds = userIds.filter(id => EncounterServiceValidation.isValidObjectId(id));
      if (validUserIds.length !== userIds.length) {
        throw new EncounterValidationError('userIds', 'Invalid user ID format detected');
      }

      // Add users to shared list (avoid duplicates)
      const objectIdUserIds = validUserIds.map(id => new Types.ObjectId(id));
      const existingSharedIds = encounter.sharedWith.map(id => id.toString());

      objectIdUserIds.forEach(userId => {
        if (!existingSharedIds.includes(userId.toString())) {
          encounter.sharedWith.push(userId);
        }
      });

      await encounter.save();

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to share encounter',
        'ENCOUNTER_SHARE_FAILED'
      );
    }
  }
}