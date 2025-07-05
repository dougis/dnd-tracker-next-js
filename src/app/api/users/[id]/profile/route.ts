import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UserService } from '@/lib/services/UserService';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session to verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Extract user ID from params
    const { id: userId } = await params;

    // Verify user can only update their own profile
    if (session.user.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'You can only update your own profile',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validatedData = userProfileUpdateSchema.parse(body);

    // Update the user profile
    const result = await UserService.updateUserProfile(userId, validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error?.message || 'Profile update failed',
          errors: result.error?.details || [
            { field: '', message: result.error?.message || 'Unknown error' },
          ],
        },
        { status: result.error?.statusCode || 400 }
      );
    }

    // Return the updated user data (sensitive fields already removed by service)
    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
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

    // Handle unexpected errors
    console.error('Profile update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session to verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Extract user ID from params
    const { id: userId } = await params;

    // Verify user can only view their own profile or if they're admin
    if (session.user.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'You can only view your own profile',
        },
        { status: 403 }
      );
    }

    // Get the user profile
    const result = await UserService.getUserById(userId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error?.message || 'User not found',
        },
        { status: result.error?.statusCode || 404 }
      );
    }

    // Return the user data (sensitive fields already removed by service)
    return NextResponse.json(
      {
        success: true,
        user: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}