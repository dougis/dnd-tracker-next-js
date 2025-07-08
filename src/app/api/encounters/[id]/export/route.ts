import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import type { ExportOptions } from '@/lib/services/EncounterServiceImportExport';
import { z } from 'zod';

const exportQuerySchema = z.object({
  format: z.enum(['json', 'xml']).default('json'),
  includeCharacterSheets: z.string().transform(v => v === 'true').default('false'),
  includePrivateNotes: z.string().transform(v => v === 'true').default('false'),
  includeIds: z.string().transform(v => v === 'true').default('false'),
  stripPersonalData: z.string().transform(v => v === 'true').default('false'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = exportQuerySchema.parse(query);

    const resolvedParams = await params;
    const encounterId = resolvedParams.id;

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // Replace with actual user ID from auth

    const options: ExportOptions = {
      includeCharacterSheets: validatedQuery.includeCharacterSheets,
      includePrivateNotes: validatedQuery.includePrivateNotes,
      includeIds: validatedQuery.includeIds,
      stripPersonalData: validatedQuery.stripPersonalData,
    };

    let result;

    if (validatedQuery.format === 'json') {
      result = await EncounterServiceImportExport.exportToJson(encounterId, userId, options);
    } else {
      result = await EncounterServiceImportExport.exportToXml(encounterId, userId, options);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Export failed' },
        { status: 400 }
      );
    }

    const contentType = validatedQuery.format === 'json'
      ? 'application/json'
      : 'application/xml';

    const filename = `encounter-${encounterId}-${Date.now()}.${validatedQuery.format}`;

    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}