import React from 'react';
import { EncounterOverview } from '../EncounterOverview';
import { ParticipantOverview } from '../ParticipantOverview';
import { EncounterNotes } from '../EncounterNotes';
import { CombatReadiness } from '../CombatReadiness';
import { EncounterSettings } from '../EncounterSettings';
import { PreparationTools } from '../PreparationTools';
import { SharingSection } from '../SharingSection';
import { InitiativeTracker } from '@/components/combat/InitiativeTracker';
import { useInitiativeTracker } from '@/lib/hooks/useInitiativeTracker';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

interface EncounterLayoutProps {
  encounter: IEncounter;
  isEditing: boolean;
  onToggleEdit: () => void;
  onEncounterUpdate?: (_encounter: IEncounter) => void;
}

/**
 * Main layout grid for encounter detail sections
 */
export function EncounterLayout({ encounter, isEditing, onToggleEdit, onEncounterUpdate }: EncounterLayoutProps) {
  const initiativeTrackerHandlers = useInitiativeTracker({
    encounter,
    onEncounterUpdate
  });

  const isCombatActive = encounter.combatState.isActive;

  if (isCombatActive) {
    return (
      <div className="space-y-6">
        {/* Combat Mode - Initiative Tracker takes priority */}
        <InitiativeTracker
          encounter={encounter}
          {...initiativeTrackerHandlers}
        />

        {/* Secondary combat information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ParticipantOverview encounter={encounter} />
          </div>
          <div className="space-y-4">
            <EncounterNotes
              encounter={encounter}
              isEditing={isEditing}
              onToggleEdit={onToggleEdit}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Primary content column */}
      <div className="lg:col-span-2 space-y-6">
        <EncounterOverview encounter={encounter} />
        <ParticipantOverview encounter={encounter} />
        <EncounterNotes
          encounter={encounter}
          isEditing={isEditing}
          onToggleEdit={onToggleEdit}
        />
      </div>

      {/* Sidebar column */}
      <div className="space-y-6">
        <CombatReadiness encounter={encounter} />
        <EncounterSettings encounter={encounter} />
        <PreparationTools encounter={encounter} />
        <SharingSection encounter={encounter} />
      </div>
    </div>
  );
}