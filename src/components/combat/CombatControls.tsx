'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  Download,
  Share2
} from 'lucide-react';

interface CombatState {
  currentRound: number;
  currentTurn: number;
  isPaused?: boolean;
  canGoPrevious: boolean;
}

interface CombatActions {
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
  onPauseCombat?: () => void;
  onResumeCombat?: () => void;
  onExportInitiative?: () => void;
  onShareInitiative?: () => void;
}

interface CombatControlsProps {
  state: CombatState;
  actions: CombatActions;
}

export function CombatControls({
  state: { currentRound, currentTurn: _currentTurn, isPaused = false, canGoPrevious },
  actions: { onNextTurn, onPreviousTurn, onPauseCombat, onResumeCombat, onExportInitiative, onShareInitiative }
}: CombatControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2>
              <CardTitle className="text-lg">Initiative Tracker</CardTitle>
            </h2>
            <Badge variant="secondary">Round {currentRound}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportInitiative}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Download initiative data"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShareInitiative}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Share initiative data"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Combat Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousTurn}
            disabled={!canGoPrevious}
          >
            <SkipBack className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onNextTurn}
            className="px-6"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Next Turn
          </Button>
          {isPaused ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResumeCombat}
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseCombat}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}