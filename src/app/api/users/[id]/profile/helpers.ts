import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';

export async function validateAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}

export async function validateUserAccess(userId: string, sessionUserId: string) {
  if (sessionUserId !== userId) {
    return NextResponse.json(
      {
        success: false,
        message: 'You can only access your own profile',
      },
      { status: 403 }
    );
  }
  return null;
}

export function handleServiceError(result: any, defaultMessage: string, defaultStatus: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message: result.error?.message || defaultMessage,
      ...(defaultStatus === 400 && { 
        errors: result.error?.details || [
          { field: '', message: result.error?.message || 'Unknown error' },
        ],
      }),
    },
    { status: result.error?.statusCode || defaultStatus }
  );
}

export function handleValidationError(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation error',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

export function handleUnexpectedError(error: unknown, operation: string) {
  console.error(`${operation} error:`, error);
  return NextResponse.json(
    {
      success: false,
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      ...data,
    },
    { status: 200 }
  );
}