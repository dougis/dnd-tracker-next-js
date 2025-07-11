import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EncounterService } from '@/lib/services/EncounterService';
import { updateEncounterSchema } from '@/lib/validations/encounter';

// Helper function to validate authentication
async function validateAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  return { session, userId: session.user.id };
}

// Helper function to validate encounter ID
async function validateEncounterId(params: Promise<{ id: string }>) {
  const { id: encounterId } = await params;
  if (!encounterId || encounterId.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'Encounter ID is required' },
      { status: 400 }
    );
  }
  return encounterId;
}

// Helper function to parse and validate request body for PUT
async function parseUpdateData(request: NextRequest) {
  try {
    const body = await request.json();
    return { data: updateEncounterSchema.parse(body), error: null };
  } catch (error) {
    return {
      data: null,
      error: NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid JSON or validation failed'
        },
        { status: 400 }
      )
    };
  }
}

// Helper function to check encounter existence and ownership
async function validateEncounterAccess(encounterId: string, userId: string) {
  const existingResult = await EncounterService.getEncounterById(encounterId);
  if (!existingResult.success) {
    const status = existingResult.error?.message === 'Encounter not found' ? 404 : 500;
    return NextResponse.json(existingResult, { status });
  }

  if (existingResult.data?.ownerId.toString() !== userId) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return existingResult;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateAuth();
    if (authResult instanceof NextResponse) return authResult;

    const encounterId = await validateEncounterId(params);
    if (encounterId instanceof NextResponse) return encounterId;

    const result = await EncounterService.getEncounterById(encounterId);
    if (!result.success) {
      const status = result.error?.message === 'Encounter not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching encounter:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const encounterId = await validateEncounterId(params);
    if (encounterId instanceof NextResponse) return encounterId;

    const parseResult = await parseUpdateData(request);
    if (parseResult.error) return parseResult.error;
    const updateData = parseResult.data!;

    const accessResult = await validateEncounterAccess(encounterId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    const result = await EncounterService.updateEncounter(encounterId, updateData);
    if (!result.success) {
      const status = result.error?.message === 'Encounter not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating encounter:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const encounterId = await validateEncounterId(params);
    if (encounterId instanceof NextResponse) return encounterId;

    // Validate access
    const accessResult = await validateEncounterAccess(encounterId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // Delete encounter
    const result = await EncounterService.deleteEncounter(encounterId);
    if (!result.success) {
      const status = result.error?.message === 'Encounter not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting encounter:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}