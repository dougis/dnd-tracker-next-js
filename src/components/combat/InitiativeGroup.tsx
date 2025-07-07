'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dice6 } from 'lucide-react';

interface InitiativeGroupProps {
  onRollInitiative?: () => void;
  disabled: boolean;
  show: boolean;
}

export function InitiativeGroup({
  onRollInitiative,
  disabled,
  show,
}: InitiativeGroupProps) {
  if (!show) return null;

  return (
    <div className="col-span-3" data-testid="initiative-group">
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
    </div>
  );
}