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
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const filters: any = {};
    if (type) filters.type = type;
    if (search) filters.search = search;

    const characters = await CharacterService.searchCharacters(
      userId,
      filters,
      { limit, offset }
    );

    return NextResponse.json({
      success: true,
      data: characters.characters,
      pagination: {
        total: characters.total,
        limit,
        offset,
        hasMore: offset + limit < characters.total
      }
    });
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

    const character = await CharacterService.createCharacter(userId, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: character,
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