'use client';

import React from 'react';
import { InitiativeGroup } from './InitiativeGroup';
import { MassActionsGroup } from './MassActionsGroup';
import { ManagementGroup } from './ManagementGroup';
import { CustomActionsGroup } from './CustomActionsGroup';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  handler: () => void;
}

interface QuickActionsSettings {
  showRollInitiative?: boolean;
  showMassActions?: boolean;
  showParticipantManagement?: boolean;
  showSettings?: boolean;
  customActions?: QuickAction[];
}

interface QuickActionsProps {
  actions: {
    onRollInitiative?: () => void;
    onMassHeal?: () => void;
    onMassDamage?: () => void;
    onClearConditions?: () => void;
    onAddParticipant?: () => void;
    onEncounterSettings?: () => void;
  };
  disabled?: boolean;
  participantCount?: number;
  settings?: QuickActionsSettings;
}


export function QuickActions({
  actions = {},
  disabled = false,
  participantCount = 0,
  settings = {}
}: QuickActionsProps) {
  const {
    showRollInitiative = true,
    showMassActions = true,
    showParticipantManagement = true,
    showSettings = true,
    customActions = [],
  } = settings || {};

  const {
    onRollInitiative,
    onMassHeal,
    onMassDamage,
    onClearConditions,
    onAddParticipant,
    onEncounterSettings,
  } = actions;

  const count = participantCount || 0;

  return (
    <div className="grid grid-cols-3 gap-2" data-testid="quick-actions-container">
      <InitiativeGroup
        onRollInitiative={onRollInitiative}
        disabled={disabled}
        show={showRollInitiative}
      />

      <MassActionsGroup
        onMassHeal={onMassHeal}
        onMassDamage={onMassDamage}
        onClearConditions={onClearConditions}
        disabled={disabled}
        participantCount={count}
        show={showMassActions}
      />

      <ManagementGroup
        onAddParticipant={onAddParticipant}
        onEncounterSettings={onEncounterSettings}
        disabled={disabled}
        showParticipantManagement={showParticipantManagement}
        showSettings={showSettings}
      />

      <CustomActionsGroup
        customActions={customActions}
        disabled={disabled}
      />
    </div>
  );
}