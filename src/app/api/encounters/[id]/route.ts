import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { updateEncounterSchema } from '@/lib/validations/encounter';
import {
  validateAuth,
  validateRouteId
} from '@/lib/api/route-helpers';

// Helper function to parse and validate request body for PUT
async function parseUpdateData(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateEncounterSchema.parse(body);
    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid JSON or validation failed'
        },
        { status: 400 }
      )
    };
  }
}

// Helper function to handle service response errors
function handleServiceError(result: any) {
  const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message;
  const status = errorMessage === 'Encounter not found' ? 404 : 500;
  return NextResponse.json(result, { status });
}

// Helper function to check encounter existence and ownership
async function validateEncounterAccess(encounterId: string, userId: string) {
  const existingResult = await EncounterService.getEncounterById(encounterId);
  if (!existingResult.success) {
    return handleServiceError(existingResult);
  }

  if (existingResult.data?.ownerId.toString() !== userId) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return existingResult;
}

// Helper function to handle common catch block errors
function handleUnexpectedError(error: unknown, operation: string) {
  console.error(`Error ${operation} encounter:`, error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}

// Helper function for common validation steps (auth + encounter ID)
async function validateBasicRequest(params: Promise<{ id: string }>) {
  const authResult = await validateAuth();
  if (authResult instanceof NextResponse) return { error: authResult };

  try {
    const encounterId = await validateRouteId(params, 'encounter');
    return { authResult, encounterId };
  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Invalid encounter ID' },
        { status: 400 }
      )
    };
  }
}

// Helper function for validation steps that include access check
async function validateRequestWithAccess(params: Promise<{ id: string }>) {
  const basicResult = await validateBasicRequest(params);
  if (basicResult.error) return basicResult;

  const { authResult, encounterId } = basicResult;
  const userId = authResult.session?.user?.id;

  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      )
    };
  }

  const accessResult = await validateEncounterAccess(encounterId, userId);
  if (accessResult instanceof NextResponse) return { error: accessResult };

  return { userId, encounterId, accessResult };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validation = await validateBasicRequest(params);
    if (validation.error) return validation.error;

    const { encounterId } = validation;

    const result = await EncounterService.getEncounterById(encounterId);
    if (!result.success) {
      return handleServiceError(result);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleUnexpectedError(error, 'fetching');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validation = await validateRequestWithAccess(params);
    if (validation.error) return validation.error;

    const { encounterId } = validation;

    const parseResult = await parseUpdateData(request);
    if (parseResult.error) return parseResult.error;
    const updateData = parseResult.data!;

    const result = await EncounterService.updateEncounter(encounterId, updateData);
    if (!result.success) {
      return handleServiceError(result);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleUnexpectedError(error, 'updating');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validation = await validateRequestWithAccess(params);
    if (validation.error) return validation.error;

    const { encounterId } = validation;

    const result = await EncounterService.deleteEncounter(encounterId);
    if (!result.success) {
      return handleServiceError(result);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleUnexpectedError(error, 'deleting');
  }
}