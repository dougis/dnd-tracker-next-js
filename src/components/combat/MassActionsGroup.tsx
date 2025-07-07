'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Zap, XCircle } from 'lucide-react';

interface MassActionsGroupProps {
  onMassHeal?: () => void;
  onMassDamage?: () => void;
  onClearConditions?: () => void;
  disabled: boolean;
  participantCount: number;
  show: boolean;
}

export function MassActionsGroup({
  onMassHeal,
  onMassDamage,
  onClearConditions,
  disabled,
  participantCount,
  show,
}: MassActionsGroupProps) {
  if (!show) return null;

  return (
    <div className="col-span-3 grid grid-cols-3 gap-2" data-testid="mass-actions-group">
      <Button
        variant="outline"
        size="sm"
        onClick={onMassHeal}
        disabled={disabled}
        title="Apply healing to multiple participants"
        aria-label={`Apply healing to ${participantCount} participants`}
      >
        <Heart className="h-4 w-4 mr-1" data-testid="heart-icon" />
        Mass Heal ({participantCount})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onMassDamage}
        disabled={disabled}
        title="Apply damage to multiple participants"
        aria-label={`Apply damage to ${participantCount} participants`}
      >
        <Zap className="h-4 w-4 mr-1" data-testid="zap-icon" />
        Mass Damage ({participantCount})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearConditions}
        disabled={disabled}
        title="Clear conditions from all participants"
        aria-label={`Clear conditions from ${participantCount} participants`}
      >
        <XCircle className="h-4 w-4 mr-1" data-testid="x-circle-icon" />
        Clear Conditions ({participantCount})
      </Button>
    </div>
  );
}