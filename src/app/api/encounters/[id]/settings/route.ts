import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { encounterSettingsSchema } from '@/lib/validations/encounter';
import { objectIdSchema } from '@/lib/validations/base';
import { ZodError } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    // Validate encounter ID format
    const encounterIdValidation = objectIdSchema.safeParse(params.id);
    if (!encounterIdValidation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: ['Invalid encounter ID format'],
        },
        { status: 400 }
      );
    }

    const encounterId = encounterIdValidation.data;

    // Parse and validate request body
    const body = await request.json();
    const settingsValidation = encounterSettingsSchema.partial().safeParse(body);

    if (!settingsValidation.success) {
      const zodError = settingsValidation.error as ZodError;
      const errors = zodError.errors.map((error) => 
        `${error.path.join('.')}: ${error.message}`
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors,
        },
        { status: 400 }
      );
    }

    const validatedSettings = settingsValidation.data;

    // Update encounter settings using the existing updateEncounter method
    // We'll wrap the settings in the proper structure for the update
    const updateData = {
      settings: validatedSettings,
    };

    const result = await EncounterService.updateEncounter(encounterId, updateData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error?.message || 'Failed to update encounter settings',
          errors: result.error?.details || [],
        },
        { status: result.error?.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Encounter settings updated successfully',
        settings: result.data?.settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating encounter settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}