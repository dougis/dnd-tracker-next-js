import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import { withAuth } from '@/lib/api/route-helpers';
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
        return NextResponse.json(
          { error: result.error?.message || 'Failed to generate share link' },
          { status: 400 }
        );
      }

      const expiresAt = new Date(Date.now() + validatedBody.expiresIn);

      return NextResponse.json({
        success: true,
        shareUrl: result.data,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error('Share error:', error);

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
  });
}