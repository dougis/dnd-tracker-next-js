import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Shared API route helpers for authentication and access control
 */

export async function validateAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      ),
      session: null
    };
  }
  return { error: null, session };
}

export async function validateUserAccess(requestedUserId: string, sessionUserId: string) {
  if (requestedUserId !== sessionUserId) {
    return NextResponse.json(
      { success: false, message: 'You can only access your own profile' },
      { status: 403 }
    );
  }
  return null;
}

export async function withAuthAndAccess(
  params: Promise<{ id: string }>,
  callback: (_userId: string) => Promise<Response>
): Promise<Response> {
  try {
    const { error: authError, session } = await validateAuth();
    if (authError) return authError;

    const { id: userId } = await params;
    const accessError = await validateUserAccess(userId, session!.user.id);
    if (accessError) return accessError;

    return await callback(userId);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...data,
  });
}

function createErrorDetails(result: any, defaultMessage: string) {
  return result.error?.details || [
    { field: '', message: result.error?.message || defaultMessage || 'Unknown error' },
  ];
}

export function handleServiceError(result: any, defaultMessage: string, defaultStatus: number = 400) {
  const message = result.error?.message || defaultMessage;
  const status = result.error?.statusCode || defaultStatus;

  const responseBody: any = {
    success: false,
    message,
  };

  if (defaultStatus === 400) {
    responseBody.errors = createErrorDetails(result, defaultMessage);
  }

  return NextResponse.json(responseBody, { status });
}

export function handleZodValidationError(error: any) {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation error',
      errors: error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Validates and extracts encounter ID from route parameters
 */
export async function validateEncounterId(params: Promise<{ id: string }>) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    throw new Error('Invalid encounter ID');
  }

  return id;
}

/**
 * Validates that a user has access to an encounter
 */
export async function validateEncounterAccess(encounterId: string, userId: string, encounterService: any) {
  const result = await encounterService.getEncounterById(encounterId);

  if (!result.success || !result.data) {
    throw new Error('Encounter not found');
  }

  if (result.data.createdBy !== userId) {
    throw new Error('Access denied');
  }

  return result.data;
}

/**
 * Validates request body and ensures required fields
 */
export async function validateRequestBody(request: Request, requiredFields: string[] = []) {
  let body;

  try {
    body = await request.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return body;
}