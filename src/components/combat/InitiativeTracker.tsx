'use client';

import React from 'react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Card, CardContent } from '@/components/ui/card';
import { CombatControls } from './CombatControls';
import { InitiativeList } from './InitiativeList';
import { useInitiativeData } from './useInitiativeData';

interface CombatActions {
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
  onPauseCombat?: () => void;
  onResumeCombat?: () => void;
  onExportInitiative?: () => void;
  onShareInitiative?: () => void;
}

interface InitiativeActions {
  onEditInitiative?: (_participantId: string, _newInitiative: number) => void;
  onDelayAction?: (_participantId: string) => void;
  onReadyAction?: (_participantId: string, _triggerCondition: string) => void;
}

interface InitiativeTrackerProps {
  encounter: IEncounter;
  combatActions: CombatActions;
  initiativeActions: InitiativeActions;
}

/**
 * Initiative Tracker Component
 *
 * Displays the initiative order and provides controls for managing combat turns.
 * Features:
 * - Initiative order display with participant information
 * - Turn progression controls
 * - Round tracking
 * - Initiative editing capabilities
 * - Export and sharing functionality
 */
export function InitiativeTracker({
  encounter,
  combatActions,
  initiativeActions
}: InitiativeTrackerProps) {
  const { initiativeWithParticipants, canGoPrevious, isPaused } = useInitiativeData(encounter);

  if (!encounter.combatState.isActive) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Combat has not started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CombatControls
        state={{
          currentRound: encounter.combatState.currentRound,
          currentTurn: encounter.combatState.currentTurn,
          isPaused,
          canGoPrevious
        }}
        actions={combatActions}
      />
      <InitiativeList
        initiativeWithParticipants={initiativeWithParticipants}
        currentTurn={encounter.combatState.currentTurn}
        onEditInitiative={initiativeActions.onEditInitiative}
        onDelayAction={initiativeActions.onDelayAction}
        onReadyAction={initiativeActions.onReadyAction}
      />
    </div>
  );
}