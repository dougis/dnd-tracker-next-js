import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { UserService } from '@/lib/services/UserService';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import { withAuthAndAccess, handleUserServiceResult, handleZodValidationError } from '@/lib/api/route-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuthAndAccess(params, async (userId) => {
    try {
      const body = await request.json();
      const validatedData = userProfileUpdateSchema.parse(body);

      const result = await UserService.updateUserProfile(userId, validatedData);
      return handleUserServiceResult(result, 'Profile updated successfully', {
        defaultErrorMessage: 'Profile update failed'
      });
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
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuthAndAccess(params, async (userId) => {
    const result = await UserService.getUserById(userId);
    return handleUserServiceResult(result);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuthAndAccess(params, async (userId) => {
    const result = await UserService.deleteUser(userId);
    return handleUserServiceResult(result, 'Account deleted successfully', {
      defaultErrorMessage: 'Account deletion failed',
      defaultErrorStatus: 500
    });
  });
}