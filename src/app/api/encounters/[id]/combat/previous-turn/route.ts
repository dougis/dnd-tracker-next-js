import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const encounterId = params.id;

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

    // Check if there's a previous turn available
    if (encounter.combat.currentTurn === 0 && encounter.combat.currentRound === 1 && encounter.combat.turnHistory.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No previous turn available' },
        { status: 400 }
      );
    }

    // Go back to previous turn using the encounter's method
    const updatedEncounter = encounter.previousTurn();

    // Save the updated encounter
    const saveResult = await EncounterService.updateEncounter(encounterId, {
      combat: updatedEncounter.combat
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
    console.error('Error going to previous turn:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}