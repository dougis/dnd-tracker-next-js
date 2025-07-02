import DOMPurify from 'isomorphic-dompurify';
import { Encounter } from '@/lib/models/encounter';
import type {
  IEncounter,
  EncounterSummary,
} from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  EncounterNotFoundError,
} from './EncounterServiceErrors';

/**
 * Encounter Service - Template and Cloning Module
 *
 * Handles encounter duplication, template creation, and encounter
 * cloning functionality for efficient encounter management.
 */
export class EncounterServiceTemplates {

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
}