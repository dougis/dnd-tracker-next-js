import { Encounter } from '@/lib/models/encounter';
import type {
  IEncounter,
  CreateEncounterInput,
} from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  EncounterNotFoundError,
  InvalidEncounterIdError,
} from './EncounterServiceErrors';
import { EncounterServiceValidation } from './EncounterServiceValidation';
import { EncounterServiceParticipants } from './EncounterServiceParticipants';
import { EncounterServiceSearch } from './EncounterServiceSearch';
import { EncounterServiceTemplates } from './EncounterServiceTemplates';
import { EncounterServiceAuth } from './EncounterServiceAuth';
import { EncounterServiceImportExport } from './EncounterServiceImportExport';

/**
 * Encounter Service Layer for D&D Encounter Tracker
 *
 * Main service class that provides business logic for encounter management,
 * delegating specialized operations to focused service modules for better
 * maintainability and adherence to single responsibility principle.
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
      const validationResult = await EncounterServiceValidation.validateEncounterData(encounterData);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
        };
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
      if (!EncounterServiceValidation.isValidObjectId(encounterId)) {
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
      if (!EncounterServiceValidation.isValidObjectId(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      // Sanitize update data
      const sanitizedData = EncounterServiceValidation.sanitizeEncounterData(updateData);

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
      if (!EncounterServiceValidation.isValidObjectId(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      const encounter = await Encounter.findByIdAndDelete(encounterId);
      if (!encounter) {
        throw new EncounterNotFoundError(encounterId);
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to delete encounter',
        'ENCOUNTER_DELETE_FAILED'
      );
    }
  }

  // ================================
  // Delegate to Specialized Modules
  // ================================

  // Participant Management
  static addParticipant = EncounterServiceParticipants.addParticipant;

  static removeParticipant = EncounterServiceParticipants.removeParticipant;

  static updateParticipant = EncounterServiceParticipants.updateParticipant;

  static reorderParticipants = EncounterServiceParticipants.reorderParticipants;

  // Search and Filtering
  static searchEncounters = EncounterServiceSearch.searchEncounters;

  static getEncountersByOwner = EncounterServiceSearch.getEncountersByOwner;

  // Template and Cloning
  static cloneEncounter = EncounterServiceTemplates.cloneEncounter;

  static createTemplate = EncounterServiceTemplates.createTemplate;

  // Ownership and Permissions
  static checkOwnership = EncounterServiceAuth.checkOwnership;

  static shareEncounter = EncounterServiceAuth.shareEncounter;

  // Validation and Data Sanitization
  static validateEncounterData = EncounterServiceValidation.validateEncounterData;

  // Import/Export Operations
  static exportToJson = EncounterServiceImportExport.exportToJson;

  static exportToXml = EncounterServiceImportExport.exportToXml;

  static importFromJson = EncounterServiceImportExport.importFromJson;

  static importFromXml = EncounterServiceImportExport.importFromXml;

  static generateShareableLink = EncounterServiceImportExport.generateShareableLink;

  static createEncounterTemplate = EncounterServiceImportExport.createTemplate;
}