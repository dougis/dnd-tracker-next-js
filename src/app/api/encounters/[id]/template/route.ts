import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { withAuth } from '@/lib/api/route-helpers';
import { handleApiError, createErrorResponse } from '../../shared-route-helpers';
import { z } from 'zod';

const templateBodySchema = z.object({
  templateName: z.string().min(1, 'Template name is required').max(100, 'Template name cannot exceed 100 characters'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId: string) => {
    try {
      const body = await request.json();
      const validatedBody = templateBodySchema.parse(body);

      const resolvedParams = await params;
      const encounterId = resolvedParams.id;

      const result = await EncounterServiceImportExport.createTemplate(
        encounterId,
        userId,
        validatedBody.templateName
      );

      if (!result.success) {
        return createErrorResponse(result.error?.message || 'Failed to create template');
      }

      return NextResponse.json({
        success: true,
        template: result.data,
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}