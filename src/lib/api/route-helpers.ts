import { NextResponse, NextRequest } from 'next/server';
import { ZodError } from 'zod';
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

/**
 * Higher-level wrapper that validates authentication and executes a callback with the user ID
 * This eliminates code duplication across API routes
 */
export async function withAuth<T>(
  callback: (_userId: string) => Promise<T>
): Promise<T | NextResponse> {
  const { error: authError, session } = await validateAuth();
  if (authError) return authError;

  return await callback(session!.user.id);
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

/**
 * Handles UserService results with specialized error handling for common patterns
 */
export function handleUserServiceResult(result: any, successMessage?: string, options?: {
  notFoundMessage?: string;
  defaultErrorMessage?: string;
  defaultErrorStatus?: number;
}) {
  if (result.success) {
    if (result.data === undefined || result.data === null) {
      // For operations like delete that return undefined data
      return createSuccessResponse({}, successMessage);
    }
    return createSuccessResponse({ user: result.data }, successMessage);
  }

  // Handle specific error codes
  if (result.error?.code === 'USER_NOT_FOUND') {
    return handleServiceError(result, options?.notFoundMessage || 'User not found', 404);
  }

  return handleServiceError(
    result,
    options?.defaultErrorMessage || 'Operation failed',
    options?.defaultErrorStatus || 500
  );
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

/**
 * Generic handler for API routes that need validation and service calls
 * Eliminates duplication across PATCH routes with validation
 */
export function createValidatedRouteHandler<T>(
  schema: any,
  serviceCall: (_userId: string, _data: T) => Promise<any>,
  successMessage: string,
  errorOptions?: {
    defaultErrorMessage?: string;
    defaultErrorStatus?: number;
  }
) {
  return async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    return withAuthAndAccess(params, async (userId) => {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);

        const result = await serviceCall(userId, validatedData);
        return handleUserServiceResult(result, successMessage, errorOptions);
      } catch (error) {
        if (error instanceof ZodError) {
          return handleZodValidationError(error);
        }
        throw error; // Let withAuthAndAccess handle unexpected errors
      }
    });
  };
}

/**
 * Generic handler for simple GET routes
 */
export function createGetRouteHandler(
  serviceCall: (_userId: string) => Promise<any>,
  errorOptions?: {
    defaultErrorMessage?: string;
    defaultErrorStatus?: number;
  }
) {
  return async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    return withAuthAndAccess(params, async (userId) => {
      const result = await serviceCall(userId);
      return handleUserServiceResult(result, undefined, errorOptions);
    });
  };
}

/**
 * Generic handler for DELETE routes
 */
export function createDeleteRouteHandler(
  serviceCall: (_userId: string) => Promise<any>,
  successMessage: string,
  errorOptions?: {
    defaultErrorMessage?: string;
    defaultErrorStatus?: number;
  }
) {
  return async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    return withAuthAndAccess(params, async (userId) => {
      const result = await serviceCall(userId);
      return handleUserServiceResult(result, successMessage, errorOptions);
    });
  };
}