import { Types } from 'mongoose';
import DOMPurify from 'isomorphic-dompurify';
import { Encounter } from '@/lib/models/encounter';
import type {
  IEncounter,
  CreateEncounterInput,
  IParticipantReference,
  EncounterSummary,
} from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  EncounterNotFoundError,
  ParticipantNotFoundError,
  InvalidEncounterIdError,
  EncounterValidationError,
} from './EncounterServiceErrors';
import { createEncounterSchema, participantReferenceSchema } from '@/lib/validations/encounter';

/**
 * Encounter Service Layer for D&D Encounter Tracker
 *
 * Provides business logic for encounter management, participant operations,
 * and combat state handling. Abstracts database operations from API routes
 * and provides consistent error handling and validation.
 */
export class EncounterService {
  // ================================
  // CRUD Operations
  // ================================

  /**
   * Create a new encounter
   */
  static async createEncounter(
    encounterData: CreateEncounterInput
  ): Promise<ServiceResult<IEncounter>> {
    try {
      // Validate and sanitize input data
      const validationResult = await this.validateEncounterData(encounterData);
      if (!validationResult.success) {
        return validationResult;
      }

      const sanitizedData = validationResult.data!;
      const encounter = await Encounter.createEncounter(sanitizedData);

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to create encounter',
        'ENCOUNTER_CREATION_FAILED'
      );
    }
  }

  /**
   * Get encounter by ID
   */
  static async getEncounterById(encounterId: string): Promise<ServiceResult<IEncounter>> {
    try {
      // Validate ID format
      if (!this.isValidObjectId(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to retrieve encounter',
        'ENCOUNTER_RETRIEVAL_FAILED'
      );
    }
  }

  /**
   * Update encounter
   */
  static async updateEncounter(
    encounterId: string,
    updateData: Partial<CreateEncounterInput>
  ): Promise<ServiceResult<IEncounter>> {
    try {
      // Validate ID format
      if (!this.isValidObjectId(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeEncounterData(updateData);

      const encounter = await Encounter.findByIdAndUpdate(
        encounterId,
        sanitizedData,
        { new: true, runValidators: true }
      );

      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      return {
        success: true,
        data: encounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to update encounter',
        'ENCOUNTER_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete encounter
   */
  static async deleteEncounter(encounterId: string): Promise<ServiceResult<void>> {
    try {
      // Validate ID format
      if (!this.isValidObjectId(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      const encounter = await Encounter.findByIdAndDelete(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      return {
        success: true,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to delete encounter',
        'ENCOUNTER_DELETION_FAILED'
      );
    }
  }

  // ================================
  // Participant Management
  // ================================

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
      const sanitizedParticipant = this.sanitizeParticipantData(participantData);

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
      const sanitizedData = this.sanitizeParticipantData(updateData);

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

  // ================================
  // Search and Filtering
  // ================================

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
      if (!this.isValidObjectId(ownerId)) {
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

  // ================================
  // Template and Cloning
  // ================================

  /**
   * Clone an encounter
   */
  static async cloneEncounter(
    encounterId: string,
    newName?: string
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const sourceEncounter = await Encounter.findById(encounterId);
      if (!sourceEncounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      const clonedEncounter = sourceEncounter.duplicateEncounter(newName);
      await clonedEncounter.save();

      return {
        success: true,
        data: clonedEncounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to clone encounter',
        'ENCOUNTER_CLONE_FAILED'
      );
    }
  }

  /**
   * Create a template from an encounter
   */
  static async createTemplate(
    encounterId: string,
    templateName: string
  ): Promise<ServiceResult<EncounterSummary>> {
    try {
      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      const template = encounter.toSummary();
      template.name = DOMPurify.sanitize(templateName);

      return {
        success: true,
        data: template,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to create template',
        'TEMPLATE_CREATION_FAILED'
      );
    }
  }

  // ================================
  // Ownership and Permissions
  // ================================

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
      const validUserIds = userIds.filter(id => this.isValidObjectId(id));
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

  // ================================
  // Validation and Data Sanitization
  // ================================

  /**
   * Validate encounter data
   */
  static async validateEncounterData(
    data: CreateEncounterInput
  ): Promise<ServiceResult<CreateEncounterInput>> {
    try {
      const validation = createEncounterSchema.safeParse(data);

      if (!validation.success) {
        throw new EncounterValidationError(
          'encounter',
          validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }

      // Sanitize the validated data
      const sanitizedData = this.sanitizeEncounterData(validation.data);

      return {
        success: true,
        data: sanitizedData,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to validate encounter data',
        'VALIDATION_ERROR'
      );
    }
  }

  // ================================
  // Private Helper Methods
  // ================================

  /**
   * Validate ObjectId format
   */
  private static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  /**
   * Sanitize encounter data to prevent XSS
   */
  private static sanitizeEncounterData(data: any): any {
    const sanitized = { ...data };

    if (sanitized.name) {
      sanitized.name = DOMPurify.sanitize(sanitized.name);
    }

    if (sanitized.description) {
      sanitized.description = DOMPurify.sanitize(sanitized.description);
    }

    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags.map((tag: string) => DOMPurify.sanitize(tag));
    }

    if (sanitized.participants && Array.isArray(sanitized.participants)) {
      sanitized.participants = sanitized.participants.map((participant: any) =>
        this.sanitizeParticipantData(participant)
      );
    }

    return sanitized;
  }

  /**
   * Sanitize participant data
   */
  private static sanitizeParticipantData(data: any): any {
    const sanitized = { ...data };

    if (sanitized.name) {
      sanitized.name = DOMPurify.sanitize(sanitized.name);
    }

    if (sanitized.notes) {
      sanitized.notes = DOMPurify.sanitize(sanitized.notes);
    }

    if (sanitized.conditions && Array.isArray(sanitized.conditions)) {
      sanitized.conditions = sanitized.conditions.map((condition: string) =>
        DOMPurify.sanitize(condition)
      );
    }

    return sanitized;
  }
}