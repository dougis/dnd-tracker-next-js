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
        const errorMessage = validation.error.errors.map(e => e.message).join(', ');
        throw new EncounterValidationError('participant', errorMessage);
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

  /**
   * Reorder participants in encounter
   */
  static async reorderParticipants(
    encounterId: string,
    participantIds: string[]
  ): Promise<ServiceResult<IEncounter>> {
    try {
      // Validate ID format
      if (!EncounterServiceValidation.isValidObjectId(encounterId)) {
        throw new EncounterValidationError('encounterId', 'Invalid encounter ID format');
      }

      // Validate participant IDs
      if (!Array.isArray(participantIds) || participantIds.length === 0) {
        throw new EncounterValidationError('participantIds', 'Participant IDs must be a non-empty array');
      }

      for (const id of participantIds) {
        if (!EncounterServiceValidation.isValidObjectId(id)) {
          throw new EncounterValidationError('participantIds', `Invalid participant ID format: ${id}`);
        }
      }

      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      // Verify all participant IDs exist in the encounter
      const existingParticipantIds = encounter.participants.map(p => p.characterId.toString());
      const missingIds = participantIds.filter(id => !existingParticipantIds.includes(id));
      
      if (missingIds.length > 0) {
        throw new ParticipantNotFoundError(`Participant IDs not found: ${missingIds.join(', ')}`);
      }

      // Verify all participants are included in the reorder
      if (participantIds.length !== encounter.participants.length) {
        throw new EncounterValidationError('participantIds', 'All participants must be included in reorder');
      }

      // Reorder participants
      const reorderedParticipants = participantIds.map(id => 
        encounter.participants.find(p => p.characterId.toString() === id)
      ).filter(Boolean) as IParticipantReference[];

      encounter.participants = reorderedParticipants;
      await encounter.save();

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to reorder participants',
        'PARTICIPANT_REORDER_FAILED'
      );
    }
  }
}