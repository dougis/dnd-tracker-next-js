import { NextRequest } from 'next/server';
import { CharacterService } from '@/lib/services/CharacterService';
import { characterCreationSchema } from '@/lib/validations/character';
import { connectToDatabase } from '@/lib/db';
import {
  createErrorResponse,
  createSuccessResponse,
  validateAuth,
  parseQueryParams
} from './helpers/api-helpers';

async function handleSearch(search: string, userId: string) {
  const result = await CharacterService.searchCharacters(search, userId);
  return result.success ? createSuccessResponse(result.data) : null;
}

async function handleTypeFilter(type: string, userId: string) {
  const result = await CharacterService.getCharactersByType(type as any, userId);
  return result.success ? createSuccessResponse(result.data) : null;
}

async function handlePaginatedQuery(userId: string, page: number, limit: number) {
  const result = await CharacterService.getCharactersByOwner(userId, page, limit);
  return result.success
    ? createSuccessResponse(result.data.items, undefined, result.data.pagination)
    : null;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = validateAuth(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { type, search, limit, page } = parseQueryParams(request.url);

    let response = null;
    if (search) {
      response = await handleSearch(search, userId);
    } else if (type) {
      response = await handleTypeFilter(type, userId);
    } else {
      response = await handlePaginatedQuery(userId, page, limit);
    }

    return response || createErrorResponse('Failed to fetch characters', 500);
  } catch (error) {
    console.error('GET /api/characters error:', error);
    return createErrorResponse('Internal server error', 500);
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
    await connectToDatabase();

    const userId = validateAuth(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validation = await validateCharacterData(body);

    if (!validation.isValid) {
      return validation.error!;
    }

    const result = await CharacterService.createCharacter(userId, validation.data!);
    if (!result.success) {
      return createErrorResponse(result.error, 400);
    }

    return createSuccessResponse(result.data, 'Character created successfully', undefined, 201);
  } catch (error) {
    console.error('POST /api/characters error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}