'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Download,
  Share2,
} from 'lucide-react';

import { IEncounter } from '@/lib/models/encounter/interfaces';
import { useCombatTimer } from '@/hooks/useCombatTimer';
import { QuickActions } from './QuickActions';
import { CombatTimer } from './CombatTimer';
import { CombatStatus } from './CombatStatus';
import { CombatControlsSection } from './CombatControls';

interface CombatActions {
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
  onPauseCombat?: () => void;
  onResumeCombat?: () => void;
  onEndCombat?: () => void;
  onExportInitiative?: () => void;
  onShareInitiative?: () => void;
}

interface InitiativeActions {
  onEditInitiative?: () => void;
  onDelayAction?: () => void;
  onReadyAction?: () => void;
  onRollInitiative?: () => void;
}

interface QuickActionsConfig {
  onMassHeal?: () => void;
  onMassDamage?: () => void;
  onClearConditions?: () => void;
  onAddParticipant?: () => void;
  onEncounterSettings?: () => void;
}

interface CustomAction {
  id: string;
  label: string;
  icon: string;
  handler: () => void;
}

interface ToolbarSettings {
  showTimer?: boolean;
  showQuickActions?: boolean;
  enableKeyboardShortcuts?: boolean;
  customActions?: CustomAction[];
}

interface CombatToolbarProps {
  encounter: IEncounter;
  combatActions?: CombatActions;
  initiativeActions?: InitiativeActions;
  quickActions?: QuickActionsConfig;
  settings?: ToolbarSettings;
}

export function CombatToolbar({
  encounter,
  combatActions = {},
  initiativeActions = {},
  quickActions = {},
  settings = {},
}: CombatToolbarProps) {
  const {
    showTimer = true,
    showQuickActions = true,
    enableKeyboardShortcuts = true,
    customActions = [],
  } = settings;

  const {
    onNextTurn,
    onPreviousTurn,
    onPauseCombat,
    onResumeCombat,
    onEndCombat,
    onExportInitiative,
    onShareInitiative,
  } = combatActions;

  const { onRollInitiative } = initiativeActions;

  // Combat state calculations with memoization
  const combatState = encounter?.combatState;
  const isActive = combatState?.isActive || false;
  const isPaused = Boolean(combatState?.pausedAt);
  const currentRound = combatState?.currentRound || 0;
  const currentTurn = combatState?.currentTurn || 0;

  const initiativeOrder = useMemo(() => combatState?.initiativeOrder || [], [combatState?.initiativeOrder]);
  const participants = useMemo(() => encounter?.participants || [], [encounter?.participants]);
  const settings_roundTimeLimit = encounter?.settings?.roundTimeLimit;

  // Calculate if Previous button should be disabled
  const canGoPrevious = !(currentRound === 1 && currentTurn === 0);

  // Combat timer hook
  const timerData = useCombatTimer({
    startedAt: combatState?.startedAt,
    pausedAt: combatState?.pausedAt,
    isActive,
    roundTimeLimit: settings_roundTimeLimit,
  });

  // Calculate participant statistics
  const participantStats = useMemo(() => {
    const total = participants.length;
    const pcs = participants.filter(p => p.isPlayer).length;
    const npcs = participants.filter(p => !p.isPlayer).length;
    const alive = participants.filter(p => p.currentHitPoints > 0).length;

    return { total, pcs, npcs, alive };
  }, [participants]);

  // Get active participant name
  const activeParticipantName = useMemo(() => {
    if (!isActive || initiativeOrder.length === 0 || currentTurn >= initiativeOrder.length) {
      return undefined;
    }

    const activeEntry = initiativeOrder[currentTurn];
    const participant = participants.find(p =>
      p.characterId.toString() === activeEntry.participantId.toString()
    );
    return participant?.name;
  }, [isActive, initiativeOrder, currentTurn, participants]);

  // Combat phase
  const combatPhase = useMemo(() => {
    if (!isActive) return 'inactive';
    if (isPaused) return 'paused';
    return 'active';
  }, [isActive, isPaused]);

  // Individual key handlers to reduce complexity
  const handleSpaceKey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    onNextTurn?.();
  }, [onNextTurn]);

  const handleBackspaceKey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    if (canGoPrevious) {
      onPreviousTurn?.();
    }
  }, [onPreviousTurn, canGoPrevious]);

  const handlePauseKey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    if (isPaused) {
      onResumeCombat?.();
    } else {
      onPauseCombat?.();
    }
  }, [onPauseCombat, onResumeCombat, isPaused]);

  const handleEndKey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    onEndCombat?.();
  }, [onEndCombat]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.code) {
      case 'Space':
        handleSpaceKey(event);
        break;
      case 'Backspace':
        handleBackspaceKey(event);
        break;
      case 'KeyP':
        handlePauseKey(event);
        break;
      case 'KeyE':
        handleEndKey(event);
        break;
    }
  }, [handleSpaceKey, handleBackspaceKey, handlePauseKey, handleEndKey]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, handleKeyDown]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2>
              <CardTitle className="text-lg">Initiative Tracker</CardTitle>
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Round {currentRound}</Badge>
              {isActive && (
                <Badge variant="outline">
                  Turn {Math.min(currentTurn + 1, initiativeOrder.length)} of {initiativeOrder.length}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Combat Timer */}
            {showTimer && isActive && (
              <CombatTimer
                formattedDuration={timerData.formattedDuration}
                hasRoundTimer={timerData.hasRoundTimer}
                formattedRoundTime={timerData.formattedRoundTime}
                isRoundWarning={timerData.isRoundWarning}
                isRoundCritical={timerData.isRoundCritical}
                isPaused={timerData.isPaused}
              />
            )}
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
              onClick={quickActions.onEncounterSettings}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Combat Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Display */}
        <CombatStatus
          participantStats={participantStats}
          activeParticipantName={activeParticipantName}
          combatPhase={combatPhase}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Essential Controls */}
        <CombatControlsSection
          actions={{
            onNextTurn,
            onPreviousTurn,
            onPauseCombat,
            onResumeCombat,
            onEndCombat,
          }}
          state={{
            canGoPrevious,
            isPaused,
            enableKeyboardShortcuts,
          }}
        />

        {/* Quick Actions */}
        {showQuickActions && (
          <>
            <Separator />
            <QuickActions
              actions={{
                onRollInitiative,
                ...quickActions,
              }}
              disabled={!isActive}
              participantCount={participantStats.total}
              settings={{
                showRollInitiative: true,
                showMassActions: true,
                showParticipantManagement: true,
                showSettings: false, // Settings already in header
                customActions,
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}