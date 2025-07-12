import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { withAuth } from '@/lib/api/route-helpers';
import { handleApiError, createErrorResponse } from '../shared-route-helpers';
import { z } from 'zod';

const shareBodySchema = z.object({
  expiresIn: z.number().min(60000).max(7 * 24 * 60 * 60 * 1000).default(24 * 60 * 60 * 1000), // 1 minute to 7 days
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId: string) => {
    try {
      const body = await request.json();
      const validatedBody = shareBodySchema.parse(body);

      const resolvedParams = await params;
      const encounterId = resolvedParams.id;

      const result = await EncounterServiceImportExport.generateShareableLink(
        encounterId,
        userId,
        validatedBody.expiresIn
      );

      if (!result.success) {
        return createErrorResponse(result.error?.message || 'Failed to generate share link');
      }

      const expiresAt = new Date(Date.now() + validatedBody.expiresIn);

      return NextResponse.json({
        success: true,
        shareUrl: result.data,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}