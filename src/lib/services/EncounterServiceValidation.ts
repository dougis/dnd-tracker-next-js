import { Types } from 'mongoose';
import DOMPurify from 'isomorphic-dompurify';
import type { CreateEncounterInput } from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  EncounterValidationError,
} from './EncounterServiceErrors';
import { createEncounterSchema } from '@/lib/validations/encounter';

/**
 * Encounter Service - Validation and Data Sanitization Module
 *
 * Handles data validation and XSS protection for encounter-related data
 * to ensure security and data integrity throughout the application.
 */
export class EncounterServiceValidation {

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
      const sanitizedData = EncounterServiceValidation.sanitizeEncounterData(validation.data);

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

  /**
   * Validate ObjectId format
   */
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  /**
   * Sanitize encounter data to prevent XSS
   */
  static sanitizeEncounterData(data: any): any {
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
        EncounterServiceValidation.sanitizeParticipantData(participant)
      );
    }

    return sanitized;
  }

  /**
   * Sanitize participant data
   */
  static sanitizeParticipantData(data: any): any {
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