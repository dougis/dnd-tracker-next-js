import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { EncounterService } from '@/lib/services/EncounterService';
import { updateEncounterSchema } from '@/lib/validations/encounter';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate encounter ID
    const encounterId = params.id;
    if (!encounterId || encounterId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Encounter ID is required' },
        { status: 400 }
      );
    }

    // Get encounter
    const result = await EncounterService.getEncounterById(encounterId);

    if (!result.success) {
      const status = result.error === 'Encounter not found' ? 404 : 500;
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
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate encounter ID
    const encounterId = params.id;
    if (!encounterId || encounterId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Encounter ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let updateData;
    try {
      const body = await request.json();
      updateData = updateEncounterSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Invalid JSON or validation failed' 
        },
        { status: 400 }
      );
    }

    // Check if encounter exists and user has permission
    const existingResult = await EncounterService.getEncounterById(encounterId);
    if (!existingResult.success) {
      const status = existingResult.error === 'Encounter not found' ? 404 : 500;
      return NextResponse.json(existingResult, { status });
    }

    // Check ownership
    if (existingResult.data.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Update encounter
    const result = await EncounterService.updateEncounter(encounterId, updateData);

    if (!result.success) {
      const status = result.error === 'Encounter not found' ? 404 : 500;
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
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate encounter ID
    const encounterId = params.id;
    if (!encounterId || encounterId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Encounter ID is required' },
        { status: 400 }
      );
    }

    // Check if encounter exists and user has permission
    const existingResult = await EncounterService.getEncounterById(encounterId);
    if (!existingResult.success) {
      const status = existingResult.error === 'Encounter not found' ? 404 : 500;
      return NextResponse.json(existingResult, { status });
    }

    // Check ownership
    if (existingResult.data.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete encounter
    const result = await EncounterService.deleteEncounter(encounterId);

    if (!result.success) {
      const status = result.error === 'Encounter not found' ? 404 : 500;
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