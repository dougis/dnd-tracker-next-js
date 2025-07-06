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

/* eslint-disable no-unused-vars */
export async function withAuthAndAccess(
  params: Promise<{ id: string }>,
  callback: (userId: string) => Promise<Response>
): Promise<Response> {
/* eslint-enable no-unused-vars */
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