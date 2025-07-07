'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dice6,
  Heart,
  Zap,
  XCircle,
  UserPlus,
  Settings,
  Star,
} from 'lucide-react';

interface QuickAction {
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

const IconMap = {
  star: Star,
  heart: Heart,
  dice: Dice6,
  zap: Zap,
  settings: Settings,
  'user-plus': UserPlus,
  'x-circle': XCircle,
};

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
  } = settings;

  const {
    onRollInitiative,
    onMassHeal,
    onMassDamage,
    onClearConditions,
    onAddParticipant,
    onEncounterSettings,
  } = actions;

  const count = participantCount || 0;

  const renderIcon = (iconName: string, className: string = 'h-4 w-4') => {
    const IconComponent = IconMap[iconName as keyof typeof IconMap] || Star;
    return <IconComponent className={className} data-testid={`${iconName}-icon`} />;
  };

  return (
    <div className="grid grid-cols-3 gap-2" data-testid="quick-actions-container">
      {/* Initiative Group */}
      <div className="col-span-3" data-testid="initiative-group">
        {showRollInitiative && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRollInitiative}
            disabled={disabled}
            className="w-full"
            title="Roll initiative for all participants"
            aria-label="Roll initiative for all participants"
          >
            <Dice6 className="h-4 w-4 mr-2" data-testid="dice-icon" />
            Roll Initiative
          </Button>
        )}
      </div>

      {/* Mass Actions Group */}
      {showMassActions && (
        <div className="col-span-3 grid grid-cols-3 gap-2" data-testid="mass-actions-group">
          <Button
            variant="outline"
            size="sm"
            onClick={onMassHeal}
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
            onClick={onMassDamage}
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
            onClick={onClearConditions}
            disabled={disabled}
            title="Clear conditions from all participants"
            aria-label={`Clear conditions from ${count} participants`}
          >
            <XCircle className="h-4 w-4 mr-1" data-testid="x-circle-icon" />
            Clear Conditions ({count})
          </Button>
        </div>
      )}

      {/* Management Group */}
      {(showParticipantManagement || showSettings) && (
        <div className="col-span-3 grid grid-cols-2 gap-2" data-testid="management-group">
          {showParticipantManagement && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddParticipant}
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
              onClick={onEncounterSettings}
              disabled={disabled}
              title="Open encounter settings"
              aria-label="Open encounter settings"
            >
              <Settings className="h-4 w-4 mr-1" data-testid="settings-icon" />
              Settings
            </Button>
          )}
        </div>
      )}

      {/* Custom Actions */}
      {customActions.length > 0 && (
        <div className="col-span-3 grid grid-cols-3 gap-2" data-testid="custom-actions-group">
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
              {renderIcon(action.icon, 'h-4 w-4 mr-1')}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}