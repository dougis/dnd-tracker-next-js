import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { z } from 'zod';

const restoreBodySchema = z.object({
  backupData: z.string().min(1, 'Backup data is required'),
  format: z.enum(['json', 'xml']),
  options: z.object({
    preserveIds: z.boolean().default(false),
    createMissingCharacters: z.boolean().default(true),
    overwriteExisting: z.boolean().default(false),
    selectiveRestore: z.array(z.string()).optional(),
  }).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedBody = restoreBodySchema.parse(body);

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // Replace with actual user ID from auth

    const backupData = parseBackupData(validatedBody);
    const validationError = validateBackupStructure(backupData);
    if (validationError) return validationError;

    const importOptions = {
      ownerId: userId,
      ...validatedBody.options,
    };

    const { results, errors } = await processEncounters(backupData, validatedBody, importOptions);

    const response = buildRestoreResponse(results, errors, backupData);
    return NextResponse.json(response);
  } catch (error) {
    return handleRestoreError(error);
  }
}

function parseBackupData(validatedBody: any): any {
  if (validatedBody.format === 'json') {
    return JSON.parse(validatedBody.backupData);
  } else {
    return parseXmlBackup(validatedBody.backupData);
  }
}

function validateBackupStructure(backupData: any): NextResponse | null {
  if (!backupData.metadata || !backupData.encounters || !Array.isArray(backupData.encounters)) {
    return NextResponse.json(
      { error: 'Invalid backup data structure' },
      { status: 400 }
    );
  }
  return null;
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
  if (format === 'json') {
    return await EncounterServiceImportExport.importFromJson(
      JSON.stringify(encounter),
      importOptions
    );
  } else {
    return await EncounterServiceImportExport.importFromXml(
      encounter,
      importOptions
    );
  }
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

function buildRestoreResponse(results: any[], errors: any[], backupData: any) {
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

function handleRestoreError(error: any): NextResponse {
  console.error('Restore error:', error);

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
      { error: 'Invalid backup data format' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

function parseXmlBackup(xmlData: string): any {
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