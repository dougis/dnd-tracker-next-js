/**
 * Encounter Import/Export Service
 *
 * Provides functionality for exporting encounters to various formats
 * and importing encounters from external sources.
 */

import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import { handleEncounterServiceError } from './EncounterServiceErrors';

// Import modular components
import type { ExportOptions, ImportOptions, EncounterExportData } from './encounter-import-export/types';
import { encounterExportSchema } from './encounter-import-export/types';
import { convertToXml, parseXmlToData } from './encounter-import-export/formatConverter';
import { prepareExportData } from './encounter-import-export/dataBuilder';
import { processImportData } from './encounter-import-export/importProcessor';
import { generateShareableLink, createTemplate } from './encounter-import-export/sharingUtils';

// Re-export types for external use
export type { ExportOptions, ImportOptions, EncounterExportData };

/**
 * Encounter Import/Export Service
 *
 * Main service class providing import/export functionality
 */
export class EncounterServiceImportExport {

  /**
   * Export encounter to JSON format
   */
  static async exportToJson(
    encounterId: string,
    userId: string,
    options: ExportOptions = {}
  ): Promise<ServiceResult<string>> {
    try {
      const exportData = await prepareExportData(encounterId, userId, 'json', options);
      if (!exportData.success) {
        return {
          success: false,
          error: exportData.error,
        };
      }

      const jsonString = JSON.stringify(exportData.data, null, 2);
      return {
        success: true,
        data: jsonString,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to export encounter to JSON',
        'ENCOUNTER_EXPORT_JSON_FAILED'
      );
    }
  }

  /**
   * Export encounter to XML format
   */
  static async exportToXml(
    encounterId: string,
    userId: string,
    options: ExportOptions = {}
  ): Promise<ServiceResult<string>> {
    try {
      const exportData = await prepareExportData(encounterId, userId, 'xml', options);
      if (!exportData.success) {
        return {
          success: false,
          error: exportData.error,
        };
      }

      const xmlString = convertToXml(exportData.data!);
      return {
        success: true,
        data: xmlString,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to export encounter to XML',
        'ENCOUNTER_EXPORT_XML_FAILED'
      );
    }
  }

  /**
   * Import encounter from JSON format
   */
  static async importFromJson(
    jsonData: string,
    options: ImportOptions
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const parsedData = JSON.parse(jsonData);
      const validationResult = encounterExportSchema.safeParse(parsedData);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: 'Invalid JSON format',
            details: validationResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
            code: 'INVALID_IMPORT_FORMAT',
            statusCode: 400,
          },
        };
      }

      return await processImportData(validationResult.data, options);
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to import encounter from JSON',
        'ENCOUNTER_IMPORT_JSON_FAILED'
      );
    }
  }

  /**
   * Import encounter from XML format
   */
  static async importFromXml(
    xmlData: string,
    options: ImportOptions
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const parsedData = parseXmlToData(xmlData);
      const validationResult = encounterExportSchema.safeParse(parsedData);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: 'Invalid XML format',
            details: validationResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
            code: 'INVALID_IMPORT_FORMAT',
            statusCode: 400,
          },
        };
      }

      return await processImportData(validationResult.data, options);
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to import encounter from XML',
        'ENCOUNTER_IMPORT_XML_FAILED'
      );
    }
  }

  /**
   * Generate shareable encounter link
   */
  static async generateShareableLink(
    encounterId: string,
    userId: string,
    expiresIn?: number
  ): Promise<ServiceResult<string>> {
    return generateShareableLink(encounterId, userId, expiresIn);
  }

  /**
   * Create encounter template for reuse
   */
  static async createTemplate(
    encounterId: string,
    userId: string,
    templateName: string
  ): Promise<ServiceResult<EncounterExportData>> {
    return createTemplate(encounterId, userId, templateName);
  }
}