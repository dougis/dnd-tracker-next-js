'use client';

import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  Download,
  Share2,
  Square,
  Clock,
} from 'lucide-react';

import { IEncounter } from '@/lib/models/encounter/interfaces';
import { useCombatTimer } from '@/hooks/useCombatTimer';
import { QuickActions } from './QuickActions';

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

  // Combat state calculations
  const combatState = encounter?.combatState;
  const isActive = combatState?.isActive || false;
  const isPaused = Boolean(combatState?.pausedAt);
  const currentRound = combatState?.currentRound || 0;
  const currentTurn = combatState?.currentTurn || 0;
  const initiativeOrder = combatState?.initiativeOrder || [];
  const participants = encounter?.participants || [];
  const settings_roundTimeLimit = encounter?.settings?.roundTimeLimit;

  // Calculate if Previous button should be disabled
  const canGoPrevious = !(currentRound === 1 && currentTurn === 0);

  // Combat timer hook
  const {
    combatDuration,
    formattedDuration,
    hasRoundTimer,
    roundTimeRemaining,
    formattedRoundTime,
    isRoundWarning,
    isRoundCritical,
    isRoundExpired,
    isPaused: timerPaused,
  } = useCombatTimer({
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

  // Get active participant
  const activeParticipant = useMemo(() => {
    if (!isActive || initiativeOrder.length === 0 || currentTurn >= initiativeOrder.length) {
      return null;
    }
    
    const activeEntry = initiativeOrder[currentTurn];
    return participants.find(p => 
      p.characterId.toString() === activeEntry.participantId.toString()
    );
  }, [isActive, initiativeOrder, currentTurn, participants]);

  // Combat phase
  const combatPhase = useMemo(() => {
    if (!isActive) return 'inactive';
    if (isPaused) return 'paused';
    return 'active';
  }, [isActive, isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onNextTurn?.();
          break;
        case 'Backspace':
          event.preventDefault();
          if (canGoPrevious) {
            onPreviousTurn?.();
          }
          break;
        case 'KeyP':
          event.preventDefault();
          if (isPaused) {
            onResumeCombat?.();
          } else {
            onPauseCombat?.();
          }
          break;
        case 'KeyE':
          event.preventDefault();
          onEndCombat?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, onNextTurn, onPreviousTurn, onPauseCombat, onResumeCombat, onEndCombat, canGoPrevious, isPaused]);

  // Round timer styling
  const getRoundTimerClass = () => {
    if (isRoundCritical) return 'text-destructive';
    if (isRoundWarning) return 'text-warning';
    return 'text-muted-foreground';
  };

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
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span aria-label={`Combat duration: ${formattedDuration.replace(':', ' minutes ')}`}>
                    {timerPaused ? 'Paused' : formattedDuration}
                  </span>
                </div>
                {hasRoundTimer && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">Round Timer:</span>
                    <span 
                      className={getRoundTimerClass()}
                      aria-label={`Round timer: ${formattedRoundTime} remaining`}
                    >
                      {formattedRoundTime}
                    </span>
                  </div>
                )}
              </div>
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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Participants: {participantStats.total}</span>
            <span>PCs: {participantStats.pcs}</span>
            <span>NPCs: {participantStats.npcs}</span>
          </div>
          <div className="flex items-center space-x-4">
            {activeParticipant && (
              <span>Active: {activeParticipant.name}</span>
            )}
            <Badge 
              variant={combatPhase === 'active' ? 'default' : combatPhase === 'paused' ? 'secondary' : 'outline'}
            >
              Combat {combatPhase === 'active' ? 'Active' : combatPhase === 'paused' ? 'Paused' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Essential Controls */}
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