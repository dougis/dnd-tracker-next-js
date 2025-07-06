import { NextRequest } from 'next/server';
import { CharacterService } from '@/lib/services/CharacterService';
import { characterCreationSchema } from '@/lib/validations/character';
import {
  createErrorResponse,
  createSuccessResponse,
  parseQueryParams
} from './helpers/api-helpers';
import {
  initializeRoute,
  handleServiceResult,
  handleRouteError
} from './helpers/route-helpers';


export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await initializeRoute(request);
    if (error) return error;

    const { type, search, limit, page } = parseQueryParams(request.url);

    let result;
    if (search) {
      result = await CharacterService.searchCharacters(search, userId!);
    } else if (type) {
      result = await CharacterService.getCharactersByType(type as any, userId!);
    } else {
      result = await CharacterService.getCharactersByOwner(userId!, page, limit);
    }

    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error, 'GET /api/characters');
  }
}

async function validateCharacterData(body: any) {
  const validation = characterCreationSchema.safeParse(body);
  if (!validation.success) {
    return {
      isValid: false,
      error: createErrorResponse('Validation failed', 400, validation.error.errors)
    };
  }
  return { isValid: true, data: validation.data };
}

export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await initializeRoute(request);
    if (error) return error;

    const body = await request.json();
    const validation = await validateCharacterData(body);
    if (!validation.isValid) return validation.error!;

    const result = await CharacterService.createCharacter(userId!, validation.data!);
    return handleServiceResult(result, 'Character created successfully');
  } catch (error) {
    return handleRouteError(error, 'POST /api/characters');
  }
}