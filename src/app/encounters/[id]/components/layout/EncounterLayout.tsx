import React from 'react';
import { EncounterOverview } from '../EncounterOverview';
import { ParticipantOverview } from '../ParticipantOverview';
import { EncounterNotes } from '../EncounterNotes';
import { CombatReadiness } from '../CombatReadiness';
import { EncounterSettings } from '../EncounterSettings';
import { PreparationTools } from '../PreparationTools';
import { SharingSection } from '../SharingSection';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

interface EncounterLayoutProps {
  encounter: IEncounter;
  isEditing: boolean;
  onToggleEdit: () => void;
}

/**
 * Main layout grid for encounter detail sections
 */
export function EncounterLayout({ encounter, isEditing, onToggleEdit }: EncounterLayoutProps) {
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