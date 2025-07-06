import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { setInitiative } from '@/lib/models/encounter/methods';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: encounterId } = await context.params;
    const body = await request.json();

    // Validate required fields
    const { participantId, initiative, dexterity } = body;
    if (!participantId || initiative === undefined || dexterity === undefined) {
      const missingFields = [];
      if (!participantId) missingFields.push('participantId');
      if (initiative === undefined) missingFields.push('initiative');
      if (dexterity === undefined) missingFields.push('dexterity');

      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
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

    // Update the initiative using the encounter method
    const success = setInitiative(encounter, participantId, initiative, dexterity);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 400 }
      );
    }

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
    console.error('Error updating initiative:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}