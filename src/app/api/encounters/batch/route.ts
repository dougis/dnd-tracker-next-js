import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { EncounterService } from '@/lib/services/EncounterService';
import { withAuth } from '@/lib/api/route-helpers';
import { handleApiError } from '../shared-route-helpers';
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
  return withAuth(async (userId: string) => {
    try {
      const body = await request.json();
      const validatedBody = batchOperationSchema.parse(body);

      const { operation, encounterIds, options } = validatedBody;
      const { results, errors } = await processBatchOperation(operation, encounterIds, userId, options);

      const response = buildBatchResponse(operation, results, errors, encounterIds.length);
      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

async function processBatchOperation(operation: string, encounterIds: string[], userId: string, options: any) {
  const results: any[] = [];
  const errors: any[] = [];

  for (const encounterId of encounterIds) {
    try {
      const result = await executeBatchOperation(operation, encounterId, userId, options);
      processBatchResult(result, encounterId, results, errors);
    } catch (error) {
      addBatchError(error, encounterId, errors);
    }
  }

  return { results, errors };
}

async function executeBatchOperation(operation: string, encounterId: string, userId: string, options: any) {
  const handlers = {
    export: () => handleBatchExport(encounterId, userId, options),
    template: () => handleBatchTemplate(encounterId, userId, options),
    delete: () => handleBatchDelete(encounterId, userId),
    archive: () => handleBatchArchive(encounterId, userId, options),
    publish: () => handleBatchPublish(encounterId, userId, options),
  };

  const handler = handlers[operation as keyof typeof handlers];
  if (!handler) {
    throw new Error(`Unsupported operation: ${operation}`);
  }

  return await handler();
}

function processBatchResult(result: any, encounterId: string, results: any[], errors: any[]) {
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
}

function addBatchError(error: any, encounterId: string, errors: any[]) {
  errors.push({
    encounterId,
    status: 'error',
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}

function buildBatchResponse(operation: string, results: any[], errors: any[], total: number) {
  return {
    success: true,
    operation,
    results,
    errors: errors.length > 0 ? errors : undefined,
    summary: {
      totalProcessed: total,
      successful: results.length,
      failed: errors.length,
    },
  };
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

  const encounter = (encounterResult as any).data!;
  const templateName = `${options.templatePrefix} - ${encounter.name}`;

  return await EncounterServiceImportExport.createTemplate(encounterId, userId, templateName);
}

async function checkEncounterOwnership(encounterId: string, userId: string, operation: string) {
  const encounterResult = await EncounterService.getEncounterById(encounterId);
  if (!encounterResult.success) {
    return encounterResult;
  }

  const encounter = encounterResult.data!;
  if (encounter.ownerId.toString() !== userId) {
    return {
      success: false,
      error: {
        message: `You do not have permission to ${operation} this encounter`,
        code: 'INSUFFICIENT_PERMISSIONS',
      },
    };
  }

  return { success: true, data: encounter };
}

async function handleBatchDelete(encounterId: string, userId: string) {
  const ownershipCheck = await checkEncounterOwnership(encounterId, userId, 'delete');
  if (!ownershipCheck.success) {
    return ownershipCheck;
  }

  return await EncounterService.deleteEncounter(encounterId);
}

async function handleBatchArchive(encounterId: string, userId: string, options: any) {
  const ownershipCheck = await checkEncounterOwnership(encounterId, userId, 'archive');
  if (!ownershipCheck.success) {
    return ownershipCheck;
  }

  const encounter = (ownershipCheck as any).data!;
  const updateData = {
    status: 'archived' as const,
    description: options.archiveReason
      ? `${encounter.description}\n\n[Archived: ${options.archiveReason}]`
      : encounter.description,
  };

  return await EncounterService.updateEncounter(encounterId, updateData);
}

async function handleBatchPublish(encounterId: string, userId: string, options: any) {
  const ownershipCheck = await checkEncounterOwnership(encounterId, userId, 'publish');
  if (!ownershipCheck.success) {
    return ownershipCheck;
  }

  const updateData = {
    isPublic: options.makePublic,
  };

  return await EncounterService.updateEncounter(encounterId, updateData);
}