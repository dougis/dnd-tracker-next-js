import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { EncounterService } from '@/lib/services/EncounterService';
import { withAuth } from '@/lib/api/route-helpers';
import {
  backupQuerySchema,
  handleApiError,
  performExportOperation,
  createExportResponse,
  generateExportFilename,
  convertBackupToXml,
} from '../shared-route-helpers';

export async function GET(request: NextRequest) {
  return withAuth(async (userId: string) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = Object.fromEntries(searchParams.entries());
      const validatedQuery = backupQuerySchema.parse(query);

      const encounters = await getUserEncounters(userId);
      const backupData = await createBackupData(encounters, userId, validatedQuery);

      return createBackupResponse(backupData, validatedQuery.format);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

async function getUserEncounters(userId: string) {
  const encountersResult = await EncounterService.getEncountersByOwner(userId);

  if (!encountersResult.success) {
    throw new Error(encountersResult.error?.message || 'Failed to get encounters');
  }

  return encountersResult.data || [];
}

async function createBackupData(encounters: any[], userId: string, validatedQuery: any) {
  const backupData = {
    metadata: {
      backupDate: new Date().toISOString(),
      userId,
      encounterCount: encounters.length,
      format: validatedQuery.format,
    },
    encounters: [] as any[],
  };

  for (const encounter of encounters) {
    const exportOptions = {
      includeCharacterSheets: validatedQuery.includeCharacterSheets,
      includePrivateNotes: validatedQuery.includePrivateNotes,
      includeIds: true,
      stripPersonalData: false,
    };

    const exportResult = await exportEncounter(encounter._id.toString(), userId, validatedQuery.format, exportOptions);

    if (exportResult.success) {
      backupData.encounters.push(
        validatedQuery.format === 'json'
          ? JSON.parse(exportResult.data!)
          : exportResult.data
      );
    }
  }

  return backupData;
}

async function exportEncounter(encounterId: string, userId: string, format: string, exportOptions: any) {
  return await performExportOperation(encounterId, userId, format as 'json' | 'xml', exportOptions);
}

function createBackupResponse(backupData: any, format: string) {
  const filename = generateExportFilename('encounters-backup', '', format).replace('--', '-');

  const responseData = format === 'json'
    ? JSON.stringify(backupData, null, 2)
    : convertBackupToXml(backupData);

  return createExportResponse(responseData, format as 'json' | 'xml', filename);
}


