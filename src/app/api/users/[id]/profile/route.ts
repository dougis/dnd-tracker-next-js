import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { UserService } from '@/lib/services/UserService';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import {
  validateAuth,
  validateUserAccess,
  handleServiceError,
  handleValidationError,
  handleUnexpectedError,
  createSuccessResponse,
} from './helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const { error: authError, session } = await validateAuth();
    if (authError) return authError;

    // Get user ID and validate access
    const { id: userId } = await params;
    const accessError = await validateUserAccess(userId, session!.user.id);
    if (accessError) return accessError;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = userProfileUpdateSchema.parse(body);

    // Update the user profile
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
      return handleValidationError(error);
    }
    return handleUnexpectedError(error, 'Profile update');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const { error: authError, session } = await validateAuth();
    if (authError) return authError;

    // Get user ID and validate access
    const { id: userId } = await params;
    const accessError = await validateUserAccess(userId, session!.user.id);
    if (accessError) return accessError;

    // Get the user profile
    const result = await UserService.getUserById(userId);

    if (!result.success) {
      return handleServiceError(result, 'User not found', 404);
    }

    return createSuccessResponse({ user: result.data });
  } catch (error) {
    return handleUnexpectedError(error, 'Profile fetch');
  }
}