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

    // Update the initiative entry
    initiativeEntry.initiative = initiative;
    initiativeEntry.dexterity = dexterity;

    // Re-sort the initiative order
    encounter.combat.initiativeOrder.sort((a, b) => {
      if (a.initiative !== b.initiative) {
        return b.initiative - a.initiative; // Higher initiative goes first
      }
      return b.dexterity - a.dexterity; // Higher dexterity breaks ties
    });

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
    console.error('Error updating initiative:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}