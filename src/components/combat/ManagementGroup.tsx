'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Settings } from 'lucide-react';

interface ManagementGroupProps {
  onAddParticipant?: () => void;
  onEncounterSettings?: () => void;
  disabled: boolean;
  showParticipantManagement: boolean;
  showSettings: boolean;
}

export function ManagementGroup({
  onAddParticipant,
  onEncounterSettings,
  disabled,
  showParticipantManagement,
  showSettings,
}: ManagementGroupProps) {
  if (!showParticipantManagement && !showSettings) return null;

  return (
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
  );
}