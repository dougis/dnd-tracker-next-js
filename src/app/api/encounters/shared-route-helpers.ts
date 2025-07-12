/**
 * Shared Route Helpers for Encounter API Routes
 *
 * This module consolidates common patterns used across encounter API route
 * implementations to eliminate code duplication.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: any): NextResponse {
  console.error('API error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request data',
        details: error.errors.map(e => e.message).join(', '),
      },
      { status: 400 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Create error response for failed operations
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: string
): NextResponse {
  const responseBody: any = { error: message };
  if (details) {
    responseBody.details = details;
  }
  return NextResponse.json(responseBody, { status });
}

/**
 * Create success response for operations
 */
export function createSuccessResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// ============================================================================
// IMPORT/EXPORT UTILITIES
// ============================================================================

/**
 * Perform import operation based on format
 */
export async function performImportOperation(
  data: string,
  format: 'json' | 'xml',
  options: any
) {
  if (format === 'json') {
    return await EncounterServiceImportExport.importFromJson(data, options);
  } else {
    return await EncounterServiceImportExport.importFromXml(data, options);
  }
}

/**
 * Perform export operation based on format
 */
export async function performExportOperation(
  encounterId: string,
  userId: string,
  format: 'json' | 'xml',
  options: any
) {
  if (format === 'json') {
    return await EncounterServiceImportExport.exportToJson(encounterId, userId, options);
  } else {
    return await EncounterServiceImportExport.exportToXml(encounterId, userId, options);
  }
}

/**
 * Create export response with appropriate headers
 */
export function createExportResponse(
  data: string,
  format: 'json' | 'xml',
  filename: string
): NextResponse {
  const contentType = format === 'json' ? 'application/json' : 'application/xml';

  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

/**
 * Generate filename for export operations
 */
export function generateExportFilename(
  prefix: string,
  id: string,
  format: 'json' | 'xml'
): string {
  return `${prefix}-${id}-${Date.now()}.${format}`;
}

// ============================================================================
// BATCH OPERATION UTILITIES
// ============================================================================

/**
 * Process batch operations with error collection
 */
export async function processBatchItems<T, R>(
  items: T[],
  processor: (_item: T, _index: number) => Promise<R>,
  options: {
    collectErrors?: boolean;
    maxConcurrency?: number;
  } = {}
): Promise<{ results: R[]; errors: any[] }> {
  const { collectErrors = true } = options;
  // maxConcurrency may be used for future optimization
  const results: R[] = [];
  const errors: any[] = [];

  // Simple sequential processing for now
  // Can be enhanced with concurrency control if needed
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processor(items[i], i);
      results.push(result);
    } catch (error) {
      if (collectErrors) {
        errors.push({
          index: i,
          item: items[i],
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } else {
        throw error; // Re-throw if not collecting errors
      }
    }
  }

  return { results, errors };
}

/**
 * Create batch operation response
 */
export function createBatchResponse(
  operation: string,
  results: any[],
  errors: any[],
  totalCount: number
) {
  return {
    success: true,
    operation,
    results,
    errors: errors.length > 0 ? errors : undefined,
    summary: {
      totalProcessed: totalCount,
      successful: results.length,
      failed: errors.length,
    },
  };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Shared options schema for import/restore operations
 */
const baseOptionsSchema = z.object({
  preserveIds: z.boolean().default(false),
  createMissingCharacters: z.boolean().default(true),
  overwriteExisting: z.boolean().default(false),
});

/**
 * Extended options schema for restore operations
 */
const restoreOptionsSchema = baseOptionsSchema.extend({
  selectiveRestore: z.array(z.string()).optional(),
});

/**
 * Standard import body validation schema
 */
export const importBodySchema = z.object({
  data: z.string().min(1, 'Import data is required'),
  format: z.enum(['json', 'xml']),
  options: baseOptionsSchema.default({}),
});

/**
 * Standard export query validation schema
 */
export const exportQuerySchema = z.object({
  format: z.enum(['json', 'xml']).default('json'),
  includeCharacterSheets: z.string().transform(v => v === 'true').default('false'),
  includePrivateNotes: z.string().transform(v => v === 'true').default('false'),
  includeIds: z.string().transform(v => v === 'true').default('false'),
  stripPersonalData: z.string().transform(v => v === 'true').default('false'),
});

/**
 * Standard backup query validation schema
 */
export const backupQuerySchema = z.object({
  includeCharacterSheets: z.string().transform(v => v === 'true').default('true'),
  includePrivateNotes: z.string().transform(v => v === 'true').default('true'),
  format: z.enum(['json', 'xml']).default('json'),
});

/**
 * Standard restore body validation schema
 */
export const restoreBodySchema = z.object({
  backupData: z.string().min(1, 'Backup data is required'),
  format: z.enum(['json', 'xml']),
  options: restoreOptionsSchema.default({}),
});

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

/**
 * Parse backup data based on format
 */
export function parseBackupData(data: string, format: 'json' | 'xml'): any {
  if (format === 'json') {
    return JSON.parse(data);
  } else {
    return parseXmlBackup(data);
  }
}

/**
 * Validate backup data structure
 */
export function validateBackupStructure(backupData: any): string | null {
  if (!backupData.metadata || !backupData.encounters || !Array.isArray(backupData.encounters)) {
    return 'Invalid backup data structure';
  }
  return null;
}

/**
 * Parse XML backup data
 */
export function parseXmlBackup(xmlData: string): any {
  const { XMLParser } = require('fast-xml-parser');

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    trimValues: true,
    parseTrueNumberOnly: false,
  });

  try {
    const jsonObj = parser.parse(xmlData);

    if (!jsonObj.encounterBackup) {
      throw new Error('Invalid backup XML structure');
    }

    const backup = jsonObj.encounterBackup;
    const metadata = {
      backupDate: backup.metadata?.backupDate || '',
      userId: backup.metadata?.userId || '',
      encounterCount: parseInt(backup.metadata?.encounterCount || '0', 10),
      format: backup.metadata?.format || 'xml',
    };

    const encounters = Array.isArray(backup.encounters?.encounter)
      ? backup.encounters.encounter
      : backup.encounters?.encounter
        ? [backup.encounters.encounter]
        : [];

    return {
      metadata,
      encounters,
    };
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error('Failed to parse XML backup data');
  }
}

/**
 * Escape XML special characters
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Convert backup data to XML
 */
export function convertBackupToXml(backupData: any): string {

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<encounterBackup>\n';
  xml += '  <metadata>\n';
  xml += `    <backupDate>${backupData.metadata.backupDate}</backupDate>\n`;
  xml += `    <userId>${escapeXml(backupData.metadata.userId)}</userId>\n`;
  xml += `    <encounterCount>${backupData.metadata.encounterCount}</encounterCount>\n`;
  xml += `    <format>${backupData.metadata.format}</format>\n`;
  xml += '  </metadata>\n';
  xml += '  <encounters>\n';

  for (const encounter of backupData.encounters) {
    xml += `    <encounter>${escapeXml(encounter)}</encounter>\n`;
  }

  xml += '  </encounters>\n';
  xml += '</encounterBackup>';

  return xml;
}

// ============================================================================
// OPERATION RESULT PROCESSING
// ============================================================================

/**
 * Process import result for consistent response format
 */
export function processImportResult(result: any): any {
  if (!result.success) {
    return {
      error: result.error?.message || 'Import failed',
      details: result.error?.details,
    };
  }

  return {
    success: true,
    encounter: {
      id: result.data?._id,
      name: result.data?.name,
      description: result.data?.description,
      participantCount: result.data?.participants?.length || 0,
    },
  };
}

/**
 * Process service result and return appropriate response
 */
export function handleServiceResult(result: any, successStatus: number = 200): NextResponse {
  if (!result.success) {
    return createErrorResponse(
      result.error?.message || 'Operation failed',
      400,
      result.error?.details
    );
  }

  return createSuccessResponse(result.data, successStatus);
}

/**
 * Create restore response with summary
 */
export function createRestoreResponse(
  results: any[],
  errors: any[],
  backupData: any
) {
  return {
    success: true,
    restored: results,
    errors: errors.length > 0 ? errors : undefined,
    summary: {
      totalEncounters: backupData.encounters.length,
      successfullyRestored: results.length,
      failed: errors.length,
      backupDate: backupData.metadata.backupDate,
    },
  };
}

// ============================================================================
// ENCOUNTER ACCESS UTILITIES
// ============================================================================

/**
 * Validate that a user has access to an encounter
 */
export async function validateEncounterOwnership(
  encounterId: string,
  userId: string,
  operation?: string
) {
  // Import here to avoid circular dependency
  const { EncounterService } = await import('@/lib/services/EncounterService');

  const encounterResult = await EncounterService.getEncounterById(encounterId);
  if (!encounterResult.success) {
    return encounterResult;
  }

  const encounter = encounterResult.data!;
  if (encounter.ownerId.toString() !== userId) {
    return {
      success: false,
      error: {
        message: operation
          ? `You do not have permission to ${operation} this encounter`
          : 'You do not have permission to access this encounter',
        code: 'INSUFFICIENT_PERMISSIONS',
      },
    };
  }

  return { success: true, data: encounter };
}