import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { z } from 'zod';

const templateBodySchema = z.object({
  templateName: z.string().min(1, 'Template name is required').max(100, 'Template name cannot exceed 100 characters'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedBody = templateBodySchema.parse(body);

    const resolvedParams = await params;
    const encounterId = resolvedParams.id;

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // Replace with actual user ID from auth

    const result = await EncounterServiceImportExport.createTemplate(
      encounterId,
      userId,
      validatedBody.templateName
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create template' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      template: result.data,
    });
  } catch (error) {
    console.error('Template creation error:', error);

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