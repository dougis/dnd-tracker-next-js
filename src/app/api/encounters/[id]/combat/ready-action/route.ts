import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: encounterId } = await context.params;
    const body = await request.json();

    // Validate required fields
    const { participantId, readyAction } = body;
    if (!participantId || readyAction === undefined) {
      const missingFields = [];
      if (!participantId) missingFields.push('participantId');
      if (readyAction === undefined) missingFields.push('readyAction');

      return NextResponse.json(
        { success: false, message: `Missing required field: ${missingFields.join(', ')}` },
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
    if (!encounter) {
      return NextResponse.json(
        { success: false, message: 'Encounter not found' },
        { status: 404 }
      );
    }

    // Validate combat state
    if (!encounter.combatState?.isActive) {
      return NextResponse.json(
        { success: false, message: 'Combat is not active' },
        { status: 400 }
      );
    }

    // Find the participant in the initiative order
    const initiativeEntry = encounter.combatState.initiativeOrder.find(
      entry => entry.participantId.toString() === participantId
    );

    if (!initiativeEntry) {
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 400 }
      );
    }

    // Set the participant's ready action
    initiativeEntry.readyAction = readyAction;

    // Save the updated encounter
    const saveResult = await EncounterService.updateEncounter(encounterId, {
      combatState: encounter.combatState
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
    console.error('Error setting ready action:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}