import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { EncounterService } from '@/lib/services/EncounterService';
import { z } from 'zod';

const batchOperationSchema = z.object({
  operation: z.enum(['export', 'template', 'delete', 'archive', 'publish']),
  encounterIds: z.array(z.string()).min(1, 'At least one encounter ID is required').max(50, 'Maximum 50 encounters allowed'),
  options: z.object({
    // Export options
    format: z.enum(['json', 'xml']).default('json'),
    includeCharacterSheets: z.boolean().default(false),
    includePrivateNotes: z.boolean().default(false),
    stripPersonalData: z.boolean().default(true),

    // Template options
    templatePrefix: z.string().max(50).default('Template'),

    // Archive options
    archiveReason: z.string().max(200).optional(),

    // Publish options
    makePublic: z.boolean().default(true),
  }).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedBody = batchOperationSchema.parse(body);

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // Replace with actual user ID from auth

    const { operation, encounterIds, options } = validatedBody;

    const results = [];
    const errors = [];

    for (const encounterId of encounterIds) {
      try {
        let result: any;

        switch (operation) {
          case 'export':
            result = await handleBatchExport(encounterId, userId, options);
            break;
          case 'template':
            result = await handleBatchTemplate(encounterId, userId, options);
            break;
          case 'delete':
            result = await handleBatchDelete(encounterId, userId);
            break;
          case 'archive':
            result = await handleBatchArchive(encounterId, userId, options);
            break;
          case 'publish':
            result = await handleBatchPublish(encounterId, userId, options);
            break;
          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }

        if (result.success) {
          results.push({
            encounterId,
            status: 'success',
            data: result.data || null,
          });
        } else {
          errors.push({
            encounterId,
            status: 'error',
            error: result.error?.message || 'Operation failed',
          });
        }
      } catch (error) {
        errors.push({
          encounterId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const response = {
      success: true,
      operation,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalProcessed: encounterIds.length,
        successful: results.length,
        failed: errors.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch operation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleBatchExport(encounterId: string, userId: string, options: any) {
  const exportOptions = {
    includeCharacterSheets: options.includeCharacterSheets,
    includePrivateNotes: options.includePrivateNotes,
    includeIds: true,
    stripPersonalData: options.stripPersonalData,
  };

  if (options.format === 'json') {
    return await EncounterServiceImportExport.exportToJson(encounterId, userId, exportOptions);
  } else {
    return await EncounterServiceImportExport.exportToXml(encounterId, userId, exportOptions);
  }
}

async function handleBatchTemplate(encounterId: string, userId: string, options: any) {
  // Get encounter details for naming
  const encounterResult = await EncounterService.getEncounterById(encounterId);
  if (!encounterResult.success) {
    return encounterResult;
  }

  const encounter = encounterResult.data!;
  const templateName = `${options.templatePrefix} - ${encounter.name}`;

  return await EncounterServiceImportExport.createTemplate(encounterId, userId, templateName);
}

async function handleBatchDelete(encounterId: string, userId: string) {
  // Check ownership before deletion
  const encounterResult = await EncounterService.getEncounterById(encounterId);
  if (!encounterResult.success) {
    return encounterResult;
  }

  const encounter = encounterResult.data!;
  if (encounter.ownerId.toString() !== userId) {
    return {
      success: false,
      error: {
        message: 'You do not have permission to delete this encounter',
        code: 'INSUFFICIENT_PERMISSIONS',
      },
    };
  }

  return await EncounterService.deleteEncounter(encounterId);
}

async function handleBatchArchive(encounterId: string, userId: string, options: any) {
  // Check ownership before archiving
  const encounterResult = await EncounterService.getEncounterById(encounterId);
  if (!encounterResult.success) {
    return encounterResult;
  }

  const encounter = encounterResult.data!;
  if (encounter.ownerId.toString() !== userId) {
    return {
      success: false,
      error: {
        message: 'You do not have permission to archive this encounter',
        code: 'INSUFFICIENT_PERMISSIONS',
      },
    };
  }

  const updateData = {
    status: 'archived' as const,
    // Add archive reason to description if provided
    description: options.archiveReason
      ? `${encounter.description}\n\n[Archived: ${options.archiveReason}]`
      : encounter.description,
  };

  return await EncounterService.updateEncounter(encounterId, updateData);
}

async function handleBatchPublish(encounterId: string, userId: string, options: any) {
  // Check ownership before publishing
  const encounterResult = await EncounterService.getEncounterById(encounterId);
  if (!encounterResult.success) {
    return encounterResult;
  }

  const encounter = encounterResult.data!;
  if (encounter.ownerId.toString() !== userId) {
    return {
      success: false,
      error: {
        message: 'You do not have permission to publish this encounter',
        code: 'INSUFFICIENT_PERMISSIONS',
      },
    };
  }

  const updateData = {
    isPublic: options.makePublic,
  };

  return await EncounterService.updateEncounter(encounterId, updateData);
}