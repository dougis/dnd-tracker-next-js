import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { EncounterService } from '@/lib/services/EncounterService';
import { z } from 'zod';

const backupQuerySchema = z.object({
  includeCharacterSheets: z.string().transform(v => v === 'true').default('true'),
  includePrivateNotes: z.string().transform(v => v === 'true').default('true'),
  format: z.enum(['json', 'xml']).default('json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = backupQuerySchema.parse(query);

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // Replace with actual user ID from auth

    const encounters = await getUserEncounters(userId);
    const backupData = await createBackupData(encounters, userId, validatedQuery);

    return createBackupResponse(backupData, validatedQuery.format);
  } catch (error) {
    return handleBackupError(error);
  }
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
  if (format === 'json') {
    return await EncounterServiceImportExport.exportToJson(encounterId, userId, exportOptions);
  } else {
    return await EncounterServiceImportExport.exportToXml(encounterId, userId, exportOptions);
  }
}

function createBackupResponse(backupData: any, format: string) {
  const contentType = format === 'json' ? 'application/json' : 'application/xml';
  const filename = `encounters-backup-${Date.now()}.${format}`;

  const responseData = format === 'json'
    ? JSON.stringify(backupData, null, 2)
    : convertBackupToXml(backupData);

  return new NextResponse(responseData, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function handleBackupError(error: any): NextResponse {
  console.error('Backup error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request parameters',
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

function convertBackupToXml(backupData: any): string {
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

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