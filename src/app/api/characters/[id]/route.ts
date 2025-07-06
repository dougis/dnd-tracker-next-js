import { NextRequest } from 'next/server';
import { CharacterService } from '@/lib/services/CharacterService';
import { characterUpdateSchema } from '@/lib/validations/character';
import { connectToDatabase } from '@/lib/db';
import {
  createErrorResponse,
  createSuccessResponse,
  validateAuth
} from '../helpers/api-helpers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function handleCharacterError(error: any) {
  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return createErrorResponse('Character not found', 404);
    }
    if (error.message.includes('access denied') || error.message.includes('forbidden')) {
      return createErrorResponse('Access denied', 403);
    }
  }
  return createErrorResponse('Internal server error', 500);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();

    const userId = validateAuth(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;
    const result = await CharacterService.getCharacterById(id, userId);

    if (!result.success) {
      return createErrorResponse(result.error, 404);
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    console.error('GET /api/characters/[id] error:', error);
    return handleCharacterError(error);
  }
}

async function validateUpdateData(body: any) {
  const validation = characterUpdateSchema.safeParse(body);
  if (!validation.success) {
    return {
      isValid: false,
      error: createErrorResponse('Validation failed', 400, validation.error.errors)
    };
  }
  return { isValid: true, data: validation.data };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();

    const userId = validateAuth(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;
    const body = await request.json();
    const validation = await validateUpdateData(body);

    if (!validation.isValid) {
      return validation.error!;
    }

    const result = await CharacterService.updateCharacter(id, userId, validation.data!);
    if (!result.success) {
      return createErrorResponse(result.error, 404);
    }

    return createSuccessResponse(result.data, 'Character updated successfully');
  } catch (error) {
    console.error('PUT /api/characters/[id] error:', error);
    return handleCharacterError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();

    const userId = validateAuth(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;
    const result = await CharacterService.deleteCharacter(id, userId);

    if (!result.success) {
      return createErrorResponse(result.error, 404);
    }

    return createSuccessResponse(null, 'Character deleted successfully');
  } catch (error) {
    console.error('DELETE /api/characters/[id] error:', error);
    return handleCharacterError(error);
  }
}