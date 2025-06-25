import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UserService } from '@/lib/services/UserService';
import { passwordResetRequestSchema } from '@/lib/validations/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = passwordResetRequestSchema.parse(body);

    // Request password reset
    const userService = new UserService();
    const result = await userService.requestPasswordReset(validatedData.email);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.message,
        },
        { status: result.error.statusCode || 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset email sent successfully',
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
    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
