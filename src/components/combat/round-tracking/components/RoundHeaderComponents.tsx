'use client';

import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  X,
  Download,
} from 'lucide-react';

interface RoundEditState {
  isEditingRound: boolean;
  editRoundValue: string;
  editError: string | null;
}

interface RoundEditHandlers {
  onEditRound: () => void;
  onSaveRound: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (_value: string) => void;
}

interface RoundHeaderProps {
  currentRound: number;
  editState: RoundEditState;
  editHandlers: RoundEditHandlers;
  combatPhase: string;
  isInOvertime: boolean;
  onExport?: () => void;
}

interface RoundControlsProps {
  currentRound: number;
  onNextRound: () => void;
  onPreviousRound: () => void;
}

// Helper components to reduce complexity
function RoundEditControls({ editState, editHandlers }: { editState: any; editHandlers: any }) {
  const { editRoundValue } = editState;
  const { onSaveRound, onCancelEdit, onEditValueChange } = editHandlers;

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="1"
        value={editRoundValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        className="w-20"
        aria-label="Current round"
      />
      <Button variant="outline" size="sm" onClick={onSaveRound} aria-label="Save">
        <Save className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancelEdit} aria-label="Cancel">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function RoundDisplayControls({ currentRound, onEditRound }: { currentRound: number; onEditRound: () => void }) {
  return (
    <>
      <h2 role="heading" aria-level={2}>
        <CardTitle className="text-xl">Round {currentRound}</CardTitle>
      </h2>
      <Button variant="ghost" size="sm" onClick={onEditRound} aria-label="Edit round">
        <Edit3 className="h-4 w-4" />
      </Button>
    </>
  );
}

export function RoundHeader({
  currentRound,
  editState,
  editHandlers,
  combatPhase,
  isInOvertime,
  onExport,
}: RoundHeaderProps) {
  const { isEditingRound, editError } = editState;

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isEditingRound ? (
            <RoundDisplayControls currentRound={currentRound} onEditRound={editHandlers.onEditRound} />
          ) : (
            <RoundEditControls editState={editState} editHandlers={editHandlers} />
          )}
          <Badge variant={isInOvertime ? "destructive" : "secondary"} className="text-xs">
            {isInOvertime ? 'Overtime' : combatPhase}
          </Badge>
        </div>
        {onExport && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onExport} aria-label="Export round data">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {editError && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{editError}</AlertDescription>
        </Alert>
      )}
    </CardHeader>
  );
}

export function RoundControls({
  currentRound,
  onNextRound,
  onPreviousRound,
}: RoundControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousRound}
        disabled={currentRound <= 1}
        aria-label="Previous round"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous Round
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={onNextRound}
        className="px-6"
        aria-label="Next round"
      >
        <ChevronRight className="h-4 w-4 mr-1" />
        Next Round
      </Button>
    </div>
  );
}