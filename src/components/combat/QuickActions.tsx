'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dice6, Heart, Zap, XCircle, UserPlus, Settings } from 'lucide-react';

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


function InitiativeSection({
  actions,
  disabled,
  show
}: {
  actions: QuickActionsProps['actions'];
  disabled: boolean;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className="col-span-3" data-testid="initiative-group">
      <Button
        variant="outline"
        size="sm"
        onClick={actions.onRollInitiative}
        disabled={disabled}
        className="w-full"
        title="Roll initiative for all participants"
        aria-label="Roll initiative for all participants"
      >
        <Dice6 className="h-4 w-4 mr-2" data-testid="dice-icon" />
        Roll Initiative
      </Button>
    </div>
  );
}

function MassActionsSection({
  actions,
  disabled,
  count,
  show
}: {
  actions: QuickActionsProps['actions'];
  disabled: boolean;
  count: number;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className="col-span-3 grid grid-cols-3 gap-2" data-testid="mass-actions-group">
      <Button
        variant="outline"
        size="sm"
        onClick={actions.onMassHeal}
        disabled={disabled}
        title="Apply healing to multiple participants"
        aria-label={`Apply healing to ${count} participants`}
      >
        <Heart className="h-4 w-4 mr-1" data-testid="heart-icon" />
        Mass Heal ({count})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={actions.onMassDamage}
        disabled={disabled}
        title="Apply damage to multiple participants"
        aria-label={`Apply damage to ${count} participants`}
      >
        <Zap className="h-4 w-4 mr-1" data-testid="zap-icon" />
        Mass Damage ({count})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={actions.onClearConditions}
        disabled={disabled}
        title="Clear conditions from all participants"
        aria-label={`Clear conditions from ${count} participants`}
      >
        <XCircle className="h-4 w-4 mr-1" data-testid="x-circle-icon" />
        Clear Conditions ({count})
      </Button>
    </div>
  );
}

function ManagementSection({
  actions,
  disabled,
  showParticipantManagement,
  showSettings
}: {
  actions: QuickActionsProps['actions'];
  disabled: boolean;
  showParticipantManagement: boolean;
  showSettings: boolean;
}) {
  const hasManagementActions = showParticipantManagement || showSettings;
  if (!hasManagementActions) return null;

  return (
    <div className="col-span-3 grid grid-cols-2 gap-2" data-testid="management-group">
      {showParticipantManagement && (
        <Button
          variant="outline"
          size="sm"
          onClick={actions.onAddParticipant}
          disabled={disabled}
          title="Add new participant to encounter"
          aria-label="Add new participant to encounter"
        >
          <UserPlus className="h-4 w-4 mr-1" data-testid="user-plus-icon" />
          Add Participant
        </Button>
      )}
      {showSettings && (
        <Button
          variant="outline"
          size="sm"
          onClick={actions.onEncounterSettings}
          disabled={disabled}
          title="Open encounter settings"
          aria-label="Open encounter settings"
        >
          <Settings className="h-4 w-4 mr-1" data-testid="settings-icon" />
          Settings
        </Button>
      )}
    </div>
  );
}

function CustomActionsSection({
  customActions,
  disabled
}: {
  customActions: QuickAction[];
  disabled: boolean;
}) {
  if (customActions.length === 0) return null;

  return (
    <div className="col-span-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(customActions.length, 3)}, 1fr)` }}>
      {customActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={action.handler}
          disabled={disabled}
          title={action.label}
          aria-label={action.label}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
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

  const count = participantCount || 0;

  return (
    <div className="grid grid-cols-3 gap-2" data-testid="quick-actions-container">
      <InitiativeSection actions={actions} disabled={disabled} show={showRollInitiative} />
      <MassActionsSection actions={actions} disabled={disabled} count={count} show={showMassActions} />
      <ManagementSection actions={actions} disabled={disabled} showParticipantManagement={showParticipantManagement} showSettings={showSettings} />
      <CustomActionsSection customActions={customActions} disabled={disabled} />
    </div>
  );
}