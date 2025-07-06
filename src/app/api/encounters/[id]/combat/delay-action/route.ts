import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const encounterId = params.id;
    const body = await request.json();

    // Validate required fields
    const { participantId } = body;
    if (!participantId) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: participantId' },
        { status: 400 }
      );
    }

    // Get the current encounter
    const encounterResult = await EncounterService.getEncounterById(encounterId);
    
    if (!encounterResult.success) {
      return NextResponse.json(
        { success: false, message: 'Encounter not found' },
        { status: 404 }
      );
    }

    const encounter = encounterResult.data;

    // Validate combat state
    if (!encounter.combat?.isActive) {
      return NextResponse.json(
        { success: false, message: 'Combat is not active' },
        { status: 400 }
      );
    }

    // Find the participant in the initiative order
    const initiativeEntry = encounter.combat.initiativeOrder.find(
      entry => entry.participantId === participantId
    );

    if (!initiativeEntry) {
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 400 }
      );
    }

    // Set the participant's action as delayed
    initiativeEntry.isDelayed = true;

    // Save the updated encounter
    const saveResult = await EncounterService.updateEncounter(encounterId, {
      combat: encounter.combat
    });

    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to save encounter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      encounter: saveResult.data
    });

  } catch (error) {
    console.error('Error delaying action:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}