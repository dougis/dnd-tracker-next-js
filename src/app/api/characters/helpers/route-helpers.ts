import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  createErrorResponse,
  createSuccessResponse,
  validateAuth
} from './api-helpers';

/**
 * Common route initialization - handles DB connection and authentication
 */
export async function initializeRoute(request: NextRequest) {
  await connectToDatabase();

  const userId = validateAuth(request);
  if (!userId) {
    return {
      error: createErrorResponse('Unauthorized', 401),
      userId: null
    };
  }

  return { error: null, userId };
}

/**
 * Handle service result and create appropriate response
 */
export function handleServiceResult(
  result: { success: boolean; data?: any; error?: any },
  successMessage?: string,
  notFoundStatus: number = 404
) {
  if (!result.success) {
    return createErrorResponse(result.error, notFoundStatus);
  }

  // Handle paginated results
  if (result.data && typeof result.data === 'object' && 'items' in result.data && 'pagination' in result.data) {
    const paginatedData = result.data as any;
    return createSuccessResponse(paginatedData.items, successMessage, paginatedData.pagination);
  }

  const status = successMessage === 'Character created successfully' ? 201 : 200;
  return createSuccessResponse(result.data, successMessage, undefined, status);
}

/**
 * Handle errors in API routes with consistent error responses
 */
export function handleRouteError(error: any, operation: string) {
  console.error(`${operation} error:`, error);

  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return createErrorResponse('Character not found', 404);
    }
    if (error.message.includes('access denied') || error.message.includes('forbidden')) {
      return createErrorResponse('Access denied', 403);
    }
    if (error.message.includes('validation')) {
      return createErrorResponse('Validation failed', 400);
    }
  }

  return createErrorResponse('Internal server error', 500);
}