import { NextRequest } from 'next/server';
// Service imports handled by shared utilities
import { withAuth } from '@/lib/api/route-helpers';
import {
  restoreBodySchema,
  handleApiError,
  parseBackupData,
  validateBackupStructure,
  performImportOperation,
  createRestoreResponse,
  createSuccessResponse,
  createErrorResponse,
} from '../shared-route-helpers';

export async function POST(request: NextRequest) {
  return withAuth(async (userId: string) => {
    try {
      const body = await request.json();
      const validatedBody = restoreBodySchema.parse(body);

      const backupData = parseBackupData(validatedBody.backupData, validatedBody.format);
      const validationError = validateBackupStructure(backupData);
      if (validationError) {
        return createErrorResponse(validationError, 400);
      }

      const importOptions = {
        ownerId: userId,
        ...validatedBody.options,
      };

      const { results, errors } = await processEncounters(backupData, validatedBody, importOptions);

      const response = createRestoreResponse(results, errors, backupData);
      return createSuccessResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}


async function processEncounters(backupData: any, validatedBody: any, importOptions: any) {
  const results: any[] = [];
  const errors: any[] = [];

  for (let i = 0; i < backupData.encounters.length; i++) {
    const encounter = backupData.encounters[i];

    if (shouldSkipEncounter(encounter, validatedBody.options, i)) {
      continue;
    }

    try {
      const result = await importEncounter(encounter, validatedBody.format, importOptions);
      processImportResult(result, encounter, i, results, errors);
    } catch (error) {
      addImportError(error, encounter, i, errors);
    }
  }

  return { results, errors };
}

function shouldSkipEncounter(encounter: any, options: any, index: number): boolean {
  return options.selectiveRestore &&
         !options.selectiveRestore.includes(encounter.encounter?.name || `encounter-${index}`);
}

async function importEncounter(encounter: any, format: string, importOptions: any) {
  const data = format === 'json' ? JSON.stringify(encounter) : encounter;
  return await performImportOperation(data, format as 'json' | 'xml', importOptions);
}

function processImportResult(result: any, encounter: any, index: number, results: any[], errors: any[]) {
  if (result.success) {
    results.push({
      originalName: encounter.encounter?.name || `encounter-${index}`,
      importedId: result.data?._id,
      importedName: result.data?.name,
      participantCount: result.data?.participants?.length || 0,
    });
  } else {
    errors.push({
      encounterName: encounter.encounter?.name || `encounter-${index}`,
      error: result.error?.message || 'Import failed',
    });
  }
}

function addImportError(error: any, encounter: any, index: number, errors: any[]) {
  errors.push({
    encounterName: encounter.encounter?.name || `encounter-${index}`,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}


