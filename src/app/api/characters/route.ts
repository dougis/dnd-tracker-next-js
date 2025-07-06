import { NextRequest, NextResponse } from 'next/server';
import { CharacterService } from '@/lib/services/CharacterService';
import { characterCreationSchema } from '@/lib/validations/character';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

    // Handle different query types
    let result;
    if (search) {
      result = await CharacterService.searchCharacters(search, userId);
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
        });
      }
    } else if (type) {
      result = await CharacterService.getCharactersByType(type as any, userId);
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
        });
      }
    } else {
      // Get all characters by owner with pagination
      const paginatedResult = await CharacterService.getCharactersByOwner(userId, page, limit);
      if (paginatedResult.success) {
        return NextResponse.json({
          success: true,
          data: paginatedResult.data.items,
          pagination: paginatedResult.data.pagination
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch characters' },
      { status: 500 }
    );
  } catch (error) {
    console.error('GET /api/characters error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validation = characterCreationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const result = await CharacterService.createCharacter(userId, validation.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Character created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/characters error:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}