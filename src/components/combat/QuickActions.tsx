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

function ActionButton({ onClick, icon, children, ...props }: any) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} {...props}>
      {icon}
      {children}
    </Button>
  );
}

function InitiativeSection({ onRollInitiative, disabled }: { onRollInitiative?: () => void; disabled: boolean }) {
  return (
    <div className="col-span-3" data-testid="initiative-group">
      <ActionButton
        onClick={onRollInitiative}
        disabled={disabled}
        className="w-full"
        title="Roll initiative for all participants"
        aria-label="Roll initiative for all participants"
        icon={<Dice6 className="h-4 w-4 mr-2" data-testid="dice-icon" />}
      >
        Roll Initiative
      </ActionButton>
    </div>
  );
}

function MassActionsSection({
  actions,
  disabled,
  count
}: {
  actions: { onMassHeal?: () => void; onMassDamage?: () => void; onClearConditions?: () => void };
  disabled: boolean;
  count: number;
}) {
  return (
    <div className="col-span-3 grid grid-cols-3 gap-2" data-testid="mass-actions-group">
      <ActionButton
        onClick={actions.onMassHeal}
        disabled={disabled}
        title="Apply healing to multiple participants"
        aria-label={`Apply healing to ${count} participants`}
        icon={<Heart className="h-4 w-4 mr-1" data-testid="heart-icon" />}
      >
        Mass Heal ({count})
      </ActionButton>
      <ActionButton
        onClick={actions.onMassDamage}
        disabled={disabled}
        title="Apply damage to multiple participants"
        aria-label={`Apply damage to ${count} participants`}
        icon={<Zap className="h-4 w-4 mr-1" data-testid="zap-icon" />}
      >
        Mass Damage ({count})
      </ActionButton>
      <ActionButton
        onClick={actions.onClearConditions}
        disabled={disabled}
        title="Clear conditions from all participants"
        aria-label={`Clear conditions from ${count} participants`}
        icon={<XCircle className="h-4 w-4 mr-1" data-testid="x-circle-icon" />}
      >
        Clear Conditions ({count})
      </ActionButton>
    </div>
  );
}

function ManagementSection({
  actions,
  disabled,
  showParticipantManagement,
  showSettings
}: {
  actions: { onAddParticipant?: () => void; onEncounterSettings?: () => void };
  disabled: boolean;
  showParticipantManagement: boolean;
  showSettings: boolean;
}) {
  return (
    <div className="col-span-3 grid grid-cols-2 gap-2" data-testid="management-group">
      {showParticipantManagement && (
        <ActionButton
          onClick={actions.onAddParticipant}
          disabled={disabled}
          title="Add new participant to encounter"
          aria-label="Add new participant to encounter"
          icon={<UserPlus className="h-4 w-4 mr-1" data-testid="user-plus-icon" />}
        >
          Add Participant
        </ActionButton>
      )}
      {showSettings && (
        <ActionButton
          onClick={actions.onEncounterSettings}
          disabled={disabled}
          title="Open encounter settings"
          aria-label="Open encounter settings"
          icon={<Settings className="h-4 w-4 mr-1" data-testid="settings-icon" />}
        >
          Settings
        </ActionButton>
      )}
    </div>
  );
}

function CustomActionsSection({ customActions, disabled }: { customActions: QuickAction[]; disabled: boolean }) {
  return (
    <div className="col-span-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(customActions.length, 3)}, 1fr)` }}>
      {customActions.map((action) => (
        <ActionButton
          key={action.id}
          onClick={action.handler}
          disabled={disabled}
          title={action.label}
          aria-label={action.label}
        >
          {action.label}
        </ActionButton>
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
      {showRollInitiative && (
        <InitiativeSection
          onRollInitiative={actions.onRollInitiative}
          disabled={disabled}
        />
      )}

      {showMassActions && (
        <MassActionsSection
          actions={actions}
          disabled={disabled}
          count={count}
        />
      )}

      {(showParticipantManagement || showSettings) && (
        <ManagementSection
          actions={actions}
          disabled={disabled}
          showParticipantManagement={showParticipantManagement}
          showSettings={showSettings}
        />
      )}

      {customActions.length > 0 && (
        <CustomActionsSection
          customActions={customActions}
          disabled={disabled}
        />
      )}
    </div>
  );
}