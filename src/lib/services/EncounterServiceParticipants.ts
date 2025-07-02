import { Encounter } from '@/lib/models/encounter';
import type {
  IEncounter,
  IParticipantReference,
} from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  EncounterNotFoundError,
  ParticipantNotFoundError,
  EncounterValidationError,
} from './EncounterServiceErrors';
import { participantReferenceSchema } from '@/lib/validations/encounter';
import { EncounterServiceValidation } from './EncounterServiceValidation';

/**
 * Encounter Service - Participant Management Module
 * 
 * Handles operations related to encounter participants including
 * adding, removing, and updating characters and NPCs in encounters.
 */
export class EncounterServiceParticipants {
  /**
   * Add participant to encounter
   */
  static async addParticipant(
    encounterId: string,
    participantData: Omit<IParticipantReference, 'characterId'> & { characterId: string }
  ): Promise<ServiceResult<IEncounter>> {
    try {
      // Validate participant data
      const validation = participantReferenceSchema.safeParse(participantData);
      if (!validation.success) {
        throw new EncounterValidationError(
          'participant',
          validation.error.errors.map(e => e.message).join(', ')
        );
      }

      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      // Sanitize participant data
      const sanitizedParticipant = EncounterServiceValidation.sanitizeParticipantData(participantData);

      encounter.addParticipant(sanitizedParticipant);
      await encounter.save();

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to add participant',
        'PARTICIPANT_ADD_FAILED'
      );
    }
  }

  /**
   * Remove participant from encounter
   */
  static async removeParticipant(
    encounterId: string,
    participantId: string
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      const removed = encounter.removeParticipant(participantId);
      if (!removed) {
        throw new ParticipantNotFoundError(participantId);
      }

      await encounter.save();

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to remove participant',
        'PARTICIPANT_REMOVE_FAILED'
      );
    }
  }

  /**
   * Update participant data
   */
  static async updateParticipant(
    encounterId: string,
    participantId: string,
    updateData: Partial<IParticipantReference>
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      // Sanitize update data
      const sanitizedData = EncounterServiceValidation.sanitizeParticipantData(updateData);

      const updated = encounter.updateParticipant(participantId, sanitizedData);
      if (!updated) {
        throw new ParticipantNotFoundError(participantId);
      }

      await encounter.save();

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to update participant',
        'PARTICIPANT_UPDATE_FAILED'
      );
    }
  }
}