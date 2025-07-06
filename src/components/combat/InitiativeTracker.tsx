'use client';

import React from 'react';
import { IEncounter, IInitiativeEntry, IParticipantReference } from '@/lib/models/encounter/interfaces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

interface InitiativeTrackerProps {
  encounter: IEncounter;
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
  onPauseCombat?: () => void;
  onResumeCombat?: () => void;
  onEndCombat?: () => void;
  onEditInitiative?: (_participantId: string, _newInitiative: number) => void;
  onDelayAction?: (_participantId: string) => void;
  onReadyAction?: (_participantId: string, _triggerCondition: string) => void;
  onExportInitiative?: () => void;
  onShareInitiative?: () => void;
}

/**
 * Initiative Tracker Component
 *
 * Displays the initiative order and provides controls for managing combat turns.
 * Features:
 * - Initiative order display with participant information
 * - Turn progression controls
 * - Round tracking
 * - Initiative editing capabilities
 * - Export and sharing functionality
 */
export function InitiativeTracker({
  encounter,
  onNextTurn,
  onPreviousTurn,
  onPauseCombat,
  onResumeCombat,
  onEndCombat: _onEndCombat,
  onEditInitiative,
  onDelayAction,
  onReadyAction,
  onExportInitiative,
  onShareInitiative
}: InitiativeTrackerProps) {
  if (!encounter.combatState.isActive) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Combat has not started</p>
        </CardContent>
      </Card>
    );
  }

  const { combatState } = encounter;
  const { initiativeOrder, currentRound, currentTurn } = combatState;

  // Get participant data for each initiative entry
  const initiativeWithParticipants = initiativeOrder.map(entry => {
    const participant = encounter.participants.find(p =>
      p.characterId.toString() === entry.participantId.toString()
    );
    return { entry, participant };
  }).filter(item => item.participant !== undefined);

  const _activeEntry = initiativeWithParticipants[currentTurn];

  return (
    <div className="space-y-4">
      {/* Combat Controls Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-lg">Initiative Tracker</CardTitle>
              <Badge variant="secondary">Round {currentRound}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportInitiative}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShareInitiative}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
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
              disabled={currentRound === 1 && currentTurn === 0}
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
            {combatState.pausedAt ? (
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

      {/* Initiative Order Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Turn Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {initiativeWithParticipants.map(({ entry, participant }, index) => (
            <InitiativeCard
              key={entry.participantId.toString()}
              entry={entry}
              participant={participant!}
              isActive={index === currentTurn}
              isNext={index === (currentTurn + 1) % initiativeWithParticipants.length}
              onEditInitiative={onEditInitiative}
              onDelayAction={onDelayAction}
              onReadyAction={onReadyAction}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface InitiativeCardProps {
  entry: IInitiativeEntry;
  participant: IParticipantReference;
  isActive: boolean;
  isNext: boolean;
  onEditInitiative?: (_participantId: string, _newInitiative: number) => void;
  onDelayAction?: (_participantId: string) => void;
  onReadyAction?: (_participantId: string, _triggerCondition: string) => void;
}

function InitiativeCard({
  entry,
  participant,
  isActive,
  isNext,
  onEditInitiative: _onEditInitiative,
  onDelayAction: _onDelayAction,
  onReadyAction: _onReadyAction
}: InitiativeCardProps) {
  const hpPercentage = (participant.currentHitPoints / participant.maxHitPoints) * 100;
  const isInjured = hpPercentage < 100;
  const isCritical = hpPercentage <= 25;

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isActive
          ? 'border-primary bg-primary/5 shadow-md'
          : isNext
          ? 'border-amber-200 bg-amber-50'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Initiative Badge */}
          <div
            className={`text-lg font-bold px-2 py-1 rounded ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {entry.initiative}
          </div>

          {/* Character Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                {participant.name}
              </h3>
              <Badge variant={participant.isPlayer ? 'default' : 'secondary'}>
                {participant.type}
              </Badge>
              {entry.hasActed && (
                <Badge variant="outline" className="text-xs">
                  Acted
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>AC {participant.armorClass}</span>
              {participant.conditions.length > 0 && (
                <div className="flex items-center space-x-1">
                  {participant.conditions.map(condition => (
                    <Badge key={condition} variant="destructive" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HP Display */}
        <div className="text-right">
          <div
            className={`text-lg font-bold ${
              isCritical
                ? 'text-destructive'
                : isInjured
                ? 'text-amber-600'
                : 'text-foreground'
            }`}
          >
            {participant.currentHitPoints}/{participant.maxHitPoints}
            {participant.temporaryHitPoints > 0 && (
              <span className="text-blue-600 ml-1">
                (+{participant.temporaryHitPoints})
              </span>
            )}
          </div>
          <Progress
            value={Math.max(hpPercentage, 0)}
            className={`w-20 h-2 ${
              isCritical
                ? '[&>div]:bg-destructive'
                : isInjured
                ? '[&>div]:bg-amber-500'
                : '[&>div]:bg-green-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
}