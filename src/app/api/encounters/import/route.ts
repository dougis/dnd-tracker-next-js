import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import type { ImportOptions } from '@/lib/services/EncounterServiceImportExport';
import { validateAuth } from '@/lib/api/route-helpers';
import { z } from 'zod';

const importBodySchema = z.object({
  data: z.string().min(1, 'Import data is required'),
  format: z.enum(['json', 'xml']),
  options: z.object({
    preserveIds: z.boolean().default(false),
    createMissingCharacters: z.boolean().default(true),
    overwriteExisting: z.boolean().default(false),
  }).default({}),
});

export async function POST(request: NextRequest) {
  try {
    // Validate authentication first
    const { error: authError, session } = await validateAuth();
    if (authError) return authError;

    const body = await request.json();
    const validatedBody = importBodySchema.parse(body);

    const userId = session!.user.id;

    const options: ImportOptions = {
      ownerId: userId,
      ...validatedBody.options,
    };

    const result = await performImport(validatedBody.data, validatedBody.format, options);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.message || 'Import failed',
          details: result.error?.details,
        },
        { status: 400 }
      );
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    return handleImportError(error);
  }
}

async function performImport(data: string, format: string, options: ImportOptions) {
  if (format === 'json') {
    return await EncounterServiceImportExport.importFromJson(data, options);
  } else {
    return await EncounterServiceImportExport.importFromXml(data, options);
  }
}

function createSuccessResponse(encounter: any) {
  return NextResponse.json({
    success: true,
    encounter: {
      id: encounter?._id,
      name: encounter?.name,
      description: encounter?.description,
      participantCount: encounter?.participants?.length || 0,
    },
  });
}

function handleImportError(error: any): NextResponse {
  console.error('Import error:', error);

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