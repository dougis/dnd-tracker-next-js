import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { validateAuth } from '@/lib/api/route-helpers';
import { z } from 'zod';

const templateBodySchema = z.object({
  templateName: z.string().min(1, 'Template name is required').max(100, 'Template name cannot exceed 100 characters'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication first
    const { error: authError, session } = await validateAuth();
    if (authError) return authError;

    const body = await request.json();
    const validatedBody = templateBodySchema.parse(body);

    const resolvedParams = await params;
    const encounterId = resolvedParams.id;

    const userId = session!.user.id;

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