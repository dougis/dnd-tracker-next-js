import { NextRequest, NextResponse } from 'next/server';
import { EncounterServiceImportExport } from '@/lib/services/EncounterServiceImportExport';
import type { ImportOptions } from '@/lib/services/EncounterServiceImportExport';
import { withAuth } from '@/lib/api/route-helpers';
import {
  importBodySchema,
  handleApiError,
  performImportOperation,
  processImportResult,
  createSuccessResponse,
  createErrorResponse,
} from '../shared-route-helpers';

export async function POST(request: NextRequest) {
  return withAuth(async (userId: string) => {
    try {
      const body = await request.json();
      const validatedBody = importBodySchema.parse(body);

      const options: ImportOptions = {
        ownerId: userId,
        ...validatedBody.options,
      };

      const result = await performImportOperation(validatedBody.data, validatedBody.format, options);
      const processedResult = processImportResult(result);

      if ('error' in processedResult) {
        return createErrorResponse(
          processedResult.error,
          400,
          processedResult.details
        );
      }

      return createSuccessResponse(processedResult);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

