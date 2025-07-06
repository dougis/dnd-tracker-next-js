import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';
import { previousTurn } from '@/lib/models/encounter/methods';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: encounterId } = await context.params;

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

    // Check if there's a previous turn available
    if (encounter.combatState.currentTurn === 0 && encounter.combatState.currentRound === 1) {
      return NextResponse.json(
        { success: false, message: 'No previous turn available' },
        { status: 400 }
      );
    }

    // Go back to previous turn using the encounter's method
    const success = previousTurn(encounter);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Unable to go to previous turn' },
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
    console.error('Error going to previous turn:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}