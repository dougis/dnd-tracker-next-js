import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UserService } from '@/lib/services/UserService';
import { getUserByEmailSchema } from '@/lib/validations/user';

export async function POST(request: NextRequest) {

    try {

        const body = await request.json();

        // Validate the request body
        const validatedData = getUserByEmailSchema.parse(body);

        // Resend verification email
        const result = await UserService.resendVerificationEmail(
            validatedData.email
        );

        if (!result.success) {

            return NextResponse.json(
                {
                    success: false,
                    message: result.error?.message || 'Unknown error',
                },
                { status: result.error?.statusCode || 400 }
            );

        }

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Verification email resent successfully',
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
        console.error('Resend verification error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred',
            },
            { status: 500 }
        );

    }

}
