import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import type { ImportOptions } from '@/lib/services/EncounterServiceImportExport';
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
    const body = await request.json();
    const validatedBody = importBodySchema.parse(body);

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // Replace with actual user ID from auth

    const options: ImportOptions = {
      ownerId: userId,
      ...validatedBody.options,
    };

    let result;

    if (validatedBody.format === 'json') {
      result = await EncounterServiceImportExport.importFromJson(
        validatedBody.data,
        options
      );
    } else {
      result = await EncounterServiceImportExport.importFromXml(
        validatedBody.data,
        options
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.message || 'Import failed',
          details: result.error?.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      encounter: {
        id: result.data?._id,
        name: result.data?.name,
        description: result.data?.description,
        participantCount: result.data?.participants?.length || 0,
      },
    });
  } catch (error) {
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
}