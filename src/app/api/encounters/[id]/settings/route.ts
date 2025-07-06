import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { encounterSettingsSchema } from '@/lib/validations/encounter';
import { objectIdSchema } from '@/lib/validations/base';
import { ZodError } from 'zod';

function createErrorResponse(message: string, errors: string[], status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

function createSuccessResponse(settings: any) {
  return NextResponse.json(
    {
      success: true,
      message: 'Encounter settings updated successfully',
      settings,
    },
    { status: 200 }
  );
}

async function validateEncounterId(params: Promise<{ id: string }>) {
  const resolvedParams = await params;
  const validation = objectIdSchema.safeParse(resolvedParams.id);

  if (!validation.success) {
    return {
      success: false as const,
      error: createErrorResponse(
        'Validation error',
        ['Invalid encounter ID format'],
        400
      ),
    };
  }

  return { success: true as const, data: validation.data };
}

async function validateRequestBody(request: NextRequest) {
  const body = await request.json();
  const validation = encounterSettingsSchema.partial().safeParse(body);

  if (!validation.success) {
    const zodError = validation.error as ZodError;
    const errors = zodError.errors.map((error) =>
      `${error.path.join('.')}: ${error.message}`
    );

    return {
      success: false as const,
      error: createErrorResponse('Validation error', errors, 400),
    };
  }

  return { success: true as const, data: validation.data };
}

function formatErrorDetails(details: any[] = []): string[] {
  return details.map(detail =>
    typeof detail === 'string' ? detail : `${detail.field}: ${detail.message}`
  );
}

async function updateEncounterSettings(encounterId: string, settings: any) {
  const result = await EncounterService.updateEncounter(encounterId, {
    settings,
  });

  if (!result.success) {
    return createErrorResponse(
      result.error?.message || 'Failed to update encounter settings',
      formatErrorDetails(result.error?.details),
      result.error?.statusCode || 500
    );
  }

  return createSuccessResponse(result.data?.settings);
}

function handleUnexpectedError(error: unknown) {
  console.error('Error updating encounter settings:', error);
  return NextResponse.json(
    {
      success: false,
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const idValidation = await validateEncounterId(context.params);
    if (!idValidation.success) {
      return idValidation.error;
    }

    const bodyValidation = await validateRequestBody(request);
    if (!bodyValidation.success) {
      return bodyValidation.error;
    }

    return await updateEncounterSettings(idValidation.data, bodyValidation.data);
  } catch (error) {
    return handleUnexpectedError(error);
  }
}