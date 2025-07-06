import { NextRequest } from 'next/server';
import { CharacterService } from '@/lib/services/CharacterService';
import { characterUpdateSchema } from '@/lib/validations/character';
import {
  createErrorResponse
} from '../helpers/api-helpers';
import {
  initializeRoute,
  handleServiceResult,
  handleRouteError
} from '../helpers/route-helpers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error, userId } = await initializeRoute(request);
    if (error) return error;

    const { id } = await context.params;
    const result = await CharacterService.getCharacterById(id, userId!);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error, 'GET /api/characters/[id]');
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
    const { error, userId } = await initializeRoute(request);
    if (error) return error;

    const { id } = await context.params;
    const body = await request.json();
    const validation = await validateUpdateData(body);
    if (!validation.isValid) return validation.error!;

    const result = await CharacterService.updateCharacter(id, userId!, validation.data!);
    return handleServiceResult(result, 'Character updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PUT /api/characters/[id]');
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { error, userId } = await initializeRoute(request);
    if (error) return error;

    const { id } = await context.params;
    const result = await CharacterService.deleteCharacter(id, userId!);
    return handleServiceResult(result, 'Character deleted successfully');
  } catch (error) {
    return handleRouteError(error, 'DELETE /api/characters/[id]');
  }
}