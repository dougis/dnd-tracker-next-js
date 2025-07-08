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

export function CombatControlsSection({ actions, state }: CombatControlsProps) {
  const getTitle = (base: string, shortcut?: string) =>
    state.enableKeyboardShortcuts && shortcut ? `${base} (${shortcut})` : base;

  const pauseResumeButton = state.isPaused ? (
    <Button
      variant="outline"
      size="sm"
      onClick={actions.onResumeCombat}
      title={getTitle('Resume Combat', 'P')}
    >
      <Play className="h-4 w-4 mr-1" />
      Resume
    </Button>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={actions.onPauseCombat}
      title={getTitle('Pause Combat', 'P')}
    >
      <Pause className="h-4 w-4 mr-1" />
      Pause
    </Button>
  );

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={actions.onPreviousTurn}
        disabled={!state.canGoPrevious}
        title={getTitle('Previous Turn', 'Backspace')}
      >
        <SkipBack className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={actions.onNextTurn}
        className="px-6"
        title={getTitle('Next Turn', 'Space')}
      >
        <SkipForward className="h-4 w-4 mr-1" />
        Next Turn
      </Button>
      {pauseResumeButton}
      <Button
        variant="destructive"
        size="sm"
        onClick={actions.onEndCombat}
        title={getTitle('End Combat', 'E')}
      >
        <Square className="h-4 w-4 mr-1" />
        End Combat
      </Button>
    </div>
  );
}