import { UserService } from '@/lib/services/UserService';
import { userProfileUpdateSchema } from '@/lib/validations/user';
import { createValidatedRouteHandler, createGetRouteHandler, createDeleteRouteHandler } from '@/lib/api/route-helpers';

export const PATCH = createValidatedRouteHandler(
  userProfileUpdateSchema,
  UserService.updateUserProfile,
  'Profile updated successfully',
  { defaultErrorMessage: 'Profile update failed' }
);

export const GET = createGetRouteHandler(
  UserService.getUserById
);

export const DELETE = createDeleteRouteHandler(
  UserService.deleteUser,
  'Account deleted successfully',
  {
    defaultErrorMessage: 'Account deletion failed',
    defaultErrorStatus: 500
  }
);