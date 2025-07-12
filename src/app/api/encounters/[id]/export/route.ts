import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import type { ExportOptions } from '@/lib/services/EncounterServiceImportExport';
import { withAuth } from '@/lib/api/route-helpers';
import {
  exportQuerySchema,
  handleApiError,
  performExportOperation,
  createExportResponse,
  generateExportFilename,
  createErrorResponse,
} from '../../shared-route-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId: string) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = Object.fromEntries(searchParams.entries());

      const validatedQuery = exportQuerySchema.parse(query);

      const resolvedParams = await params;
      const encounterId = resolvedParams.id;

      const options: ExportOptions = {
        includeCharacterSheets: validatedQuery.includeCharacterSheets,
        includePrivateNotes: validatedQuery.includePrivateNotes,
        includeIds: validatedQuery.includeIds,
        stripPersonalData: validatedQuery.stripPersonalData,
      };

      const result = await performExportOperation(encounterId, userId, validatedQuery.format, options);

      if (!result.success) {
        return createErrorResponse(
          result.error?.message || 'Export failed',
          400
        );
      }

      const filename = generateExportFilename('encounter', encounterId, validatedQuery.format);

      return createExportResponse(result.data!, validatedQuery.format, filename);
    } catch (error) {
      return handleApiError(error);
    }
  });
}