import { NextRequest, NextResponse } from 'next/server';
import { EncounterService } from '@/lib/services/EncounterService';

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

    if (!encounter.combatState.pausedAt) {
      return NextResponse.json(
        { success: false, message: 'Combat is not paused' },
        { status: 400 }
      );
    }

    // Resume combat
    encounter.combatState.pausedAt = undefined;

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
    console.error('Error resuming combat:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}