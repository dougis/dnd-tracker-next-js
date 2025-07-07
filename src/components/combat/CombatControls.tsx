'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
} from 'lucide-react';

interface CombatActions {
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
  onPauseCombat?: () => void;
  onResumeCombat?: () => void;
  onEndCombat?: () => void;
}

interface CombatState {
  canGoPrevious: boolean;
  isPaused: boolean;
  enableKeyboardShortcuts: boolean;
}

interface CombatControlsProps {
  actions: CombatActions;
  state: CombatState;
}

export function CombatControlsSection({
  actions,
  state,
}: CombatControlsProps) {
  const {
    onNextTurn,
    onPreviousTurn,
    onPauseCombat,
    onResumeCombat,
    onEndCombat,
  } = actions;

  const {
    canGoPrevious,
    isPaused,
    enableKeyboardShortcuts,
  } = state;
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousTurn}
        disabled={!canGoPrevious}
        title={enableKeyboardShortcuts ? 'Previous Turn (Backspace)' : 'Previous Turn'}
      >
        <SkipBack className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onNextTurn}
        className="px-6"
        title={enableKeyboardShortcuts ? 'Next Turn (Space)' : 'Next Turn'}
      >
        <SkipForward className="h-4 w-4 mr-1" />
        Next Turn
      </Button>
      {isPaused ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onResumeCombat}
          title={enableKeyboardShortcuts ? 'Resume Combat (P)' : 'Resume Combat'}
        >
          <Play className="h-4 w-4 mr-1" />
          Resume
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onPauseCombat}
          title={enableKeyboardShortcuts ? 'Pause Combat (P)' : 'Pause Combat'}
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={onEndCombat}
        title={enableKeyboardShortcuts ? 'End Combat (E)' : 'End Combat'}
      >
        <Square className="h-4 w-4 mr-1" />
        End Combat
      </Button>
    </div>
  );
}