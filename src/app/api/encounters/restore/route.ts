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

    // Parse backup data
    let backupData;
    if (validatedBody.format === 'json') {
      backupData = JSON.parse(validatedBody.backupData);
    } else {
      backupData = parseXmlBackup(validatedBody.backupData);
    }

    // Validate backup structure
    if (!backupData.metadata || !backupData.encounters || !Array.isArray(backupData.encounters)) {
      return NextResponse.json(
        { error: 'Invalid backup data structure' },
        { status: 400 }
      );
    }

    const importOptions = {
      ownerId: userId,
      ...validatedBody.options,
    };

    const results = [];
    const errors = [];

    // Process each encounter in the backup
    for (let i = 0; i < backupData.encounters.length; i++) {
      const encounter = backupData.encounters[i];

      // Skip if selective restore is enabled and this encounter isn't selected
      if (validatedBody.options.selectiveRestore &&
          !validatedBody.options.selectiveRestore.includes(encounter.encounter?.name || `encounter-${i}`)) {
        continue;
      }

      try {
        let result;

        if (validatedBody.format === 'json') {
          result = await EncounterServiceImportExport.importFromJson(
            JSON.stringify(encounter),
            importOptions
          );
        } else {
          result = await EncounterServiceImportExport.importFromXml(
            encounter,
            importOptions
          );
        }

        if (result.success) {
          results.push({
            originalName: encounter.encounter?.name || `encounter-${i}`,
            importedId: result.data?._id,
            importedName: result.data?.name,
            participantCount: result.data?.participants?.length || 0,
          });
        } else {
          errors.push({
            encounterName: encounter.encounter?.name || `encounter-${i}`,
            error: result.error?.message || 'Import failed',
          });
        }
      } catch (error) {
        errors.push({
          encounterName: encounter.encounter?.name || `encounter-${i}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const response = {
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

    return NextResponse.json(response);
  } catch (error) {
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
}

function parseXmlBackup(xmlData: string): any {
  // Simple XML parser for backup data
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

  const backupElement = xmlDoc.querySelector('encounterBackup');
  if (!backupElement) {
    throw new Error('Invalid backup XML structure');
  }

  const metadata = {
    backupDate: xmlDoc.querySelector('metadata backupDate')?.textContent || '',
    userId: xmlDoc.querySelector('metadata userId')?.textContent || '',
    encounterCount: parseInt(xmlDoc.querySelector('metadata encounterCount')?.textContent || '0', 10),
    format: xmlDoc.querySelector('metadata format')?.textContent || 'xml',
  };

  const encounterElements = xmlDoc.querySelectorAll('encounters encounter');
  const encounters = Array.from(encounterElements).map(el => el.textContent || '');

  return {
    metadata,
    encounters,
  };
}