import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { UserService } from '@/lib/services/UserService';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import { withAuthAndAccess, createSuccessResponse, handleServiceError, handleZodValidationError } from '@/lib/api/route-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuthAndAccess(params, async (userId) => {
    try {
      const body = await request.json();
      const validatedData = userProfileUpdateSchema.parse(body);

      const result = await UserService.updateUserProfile(userId, validatedData);

      if (!result.success) {
        return handleServiceError(result, 'Profile update failed');
      }

      return createSuccessResponse(
        { user: result.data },
        'Profile updated successfully'
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodValidationError(error);
      }
      throw error; // Let withAuthAndAccess handle unexpected errors
    }
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuthAndAccess(params, async (userId) => {
    const result = await UserService.getUserById(userId);

    if (!result.success) {
      return handleServiceError(result, 'User not found', 404);
    }

    return createSuccessResponse({ user: result.data });
  });
}