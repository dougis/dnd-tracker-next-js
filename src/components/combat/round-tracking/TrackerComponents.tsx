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
  TrendingUp,
  AlertTriangle,
  Download,
  Zap,
} from 'lucide-react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import {
  Effect,
  Trigger,
  formatDuration,
  formatTimeUntilTrigger,
  formatRoundSummary,
} from './round-utils';
import type { SessionSummary } from './round-utils';
import {
  findParticipantName,
  calculateEffectRemaining,
  getEffectClassName,
} from './tracker-utils';

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

interface RoundControlsProps {
  currentRound: number;
  onNextRound: () => void;
  onPreviousRound: () => void;
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

interface DurationDisplayProps {
  duration: {
    total: number;
    average: number;
    remaining: number | null;
    formatted: string;
  };
  estimatedRoundDuration?: number;
}

export function DurationDisplay({ duration, estimatedRoundDuration }: DurationDisplayProps) {
  if (duration.total <= 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div className="text-center">
        <div className="font-medium">Total</div>
        <div className="text-muted-foreground">{duration.formatted}</div>
      </div>

      {estimatedRoundDuration && (
        <div className="text-center">
          <div className="font-medium">Per Round</div>
          <div className="text-muted-foreground">
            ~{formatDuration(estimatedRoundDuration)}
          </div>
        </div>
      )}

      {duration.remaining !== null && (
        <div className="text-center">
          <div className="font-medium">Estimated</div>
          <div className="text-muted-foreground">
            {formatDuration(duration.remaining)} remaining
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="font-medium">Average</div>
        <div className="text-muted-foreground">
          {formatDuration(duration.average)}/round
        </div>
      </div>
    </div>
  );
}

interface EffectsSectionProps {
  effects: Effect[];
  effectsError?: string;
  encounter: IEncounter | null;
  currentRound: number;
  effectsByParticipant: Record<string, Effect[]>;
}

// Helper components to reduce complexity
function EffectItem({ effect, currentRound, participantName }: {
  effect: Effect;
  currentRound: number;
  participantName: string;
}) {
  const { remaining, isExpiring } = calculateEffectRemaining(effect, currentRound);

  return (
    <div
      key={effect.id}
      className={getEffectClassName(isExpiring)}
      data-expiring={isExpiring || undefined}
      aria-label={`${effect.name} effect on ${participantName}`}
    >
      <div className="flex-1">
        <div className="font-medium text-sm">{effect.name}</div>
        <div className="text-xs text-muted-foreground">
          {effect.description}
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm font-medium">
          {remaining} rounds
        </div>
        {isExpiring && (
          <div className="text-xs text-orange-600 dark:text-orange-400">
            Expiring soon
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantEffects({ 
  participantId, 
  participantEffects, 
  encounter, 
  currentRound 
}: {
  participantId: string;
  participantEffects: Effect[];
  encounter: IEncounter | null;
  currentRound: number;
}) {
  const participantName = findParticipantName(encounter, participantId);

  return (
    <div key={participantId} className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        {participantName}
      </h4>

      <div className="grid gap-2">
        {participantEffects.map((effect) => (
          <EffectItem
            key={effect.id}
            effect={effect}
            currentRound={currentRound}
            participantName={participantName}
          />
        ))}
      </div>
    </div>
  );
}

export function EffectsSection({
  effects,
  effectsError,
  encounter,
  currentRound,
  effectsByParticipant,
}: EffectsSectionProps) {
  if (effects.length === 0 && !effectsError) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Active Effects
        {effects.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {effects.length}
          </Badge>
        )}
      </h3>

      {effectsError && (
        <Alert variant="destructive">
          <AlertDescription>{effectsError}</AlertDescription>
        </Alert>
      )}

      {Object.entries(effectsByParticipant).map(([participantId, participantEffects]) => (
        <ParticipantEffects
          key={participantId}
          participantId={participantId}
          participantEffects={participantEffects}
          encounter={encounter}
          currentRound={currentRound}
        />
      ))}
    </div>
  );
}

interface TriggersSectionProps {
  dueTriggers: Trigger[];
  upcomingTriggers: Trigger[];
  triggers: Trigger[];
  currentRound: number;
  duration: { average: number };
  onTriggerAction?: (_triggerId: string) => void;
}

// Helper components to reduce complexity
function DueTriggerItem({ trigger, onActivate }: { trigger: Trigger; onActivate: (id: string) => void }) {
  return (
    <div
      key={trigger.id}
      className="flex items-center justify-between p-3 rounded border border-orange-300 bg-orange-50 dark:bg-orange-950/20"
      data-due="true"
    >
      <div className="flex-1">
        <div className="font-medium text-sm">{trigger.name}</div>
        <div className="text-xs text-muted-foreground">
          {trigger.description}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onActivate(trigger.id)}
        aria-label={`Activate ${trigger.name}`}
      >
        Activate
      </Button>
    </div>
  );
}

function UpcomingTriggerItem({ trigger, currentRound, averageDuration }: { 
  trigger: Trigger; 
  currentRound: number; 
  averageDuration: number; 
}) {
  return (
    <div
      key={trigger.id}
      className="flex items-center justify-between p-2 rounded border"
    >
      <div className="flex-1">
        <div className="font-medium text-sm">{trigger.name}</div>
        <div className="text-xs text-muted-foreground">
          {trigger.description}
        </div>
      </div>

      <div className="text-right text-sm">
        <div className="font-medium">Round {trigger.triggerRound}</div>
        <div className="text-xs text-muted-foreground">
          {formatTimeUntilTrigger(trigger, currentRound, averageDuration)}
        </div>
      </div>
    </div>
  );
}

function CompletedTriggerItem({ trigger }: { trigger: Trigger }) {
  return (
    <div
      key={trigger.id}
      className="flex items-center justify-between p-2 rounded border bg-muted/20"
    >
      <div className="flex-1">
        <div className="font-medium text-sm text-muted-foreground">
          {trigger.name}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Triggered in Round {trigger.triggeredRound}
      </div>
    </div>
  );
}

export function TriggersSection({
  dueTriggers,
  upcomingTriggers,
  triggers,
  currentRound,
  duration,
  onTriggerAction,
}: TriggersSectionProps) {
  // Show triggers section if there are due, upcoming, or completed triggers
  const hasCompletedTriggers = triggers.some(t => !t.isActive);
  if (dueTriggers.length === 0 && upcomingTriggers.length === 0 && !hasCompletedTriggers) {
    return null;
  }

  const handleTriggerActivation = (triggerId: string) => {
    if (onTriggerAction) {
      onTriggerAction(triggerId);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Triggers & Reminders
      </h3>

      {/* Due triggers */}
      {dueTriggers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Due This Round
          </h4>

          {dueTriggers.map((trigger) => (
            <DueTriggerItem
              key={trigger.id}
              trigger={trigger}
              onActivate={handleTriggerActivation}
            />
          ))}
        </div>
      )}

      {/* Upcoming triggers */}
      {upcomingTriggers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Upcoming
          </h4>

          {upcomingTriggers.slice(0, 3).map((trigger) => (
            <UpcomingTriggerItem
              key={trigger.id}
              trigger={trigger}
              currentRound={currentRound}
              averageDuration={duration.average}
            />
          ))}

          {upcomingTriggers.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{upcomingTriggers.length - 3} more triggers
            </div>
          )}
        </div>
      )}

      {/* Completed triggers */}
      {hasCompletedTriggers && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Completed
          </h4>

          {triggers
            .filter(t => !t.isActive)
            .slice(-2)
            .map((trigger) => (
              <CompletedTriggerItem key={trigger.id} trigger={trigger} />
            ))}
        </div>
      )}
    </div>
  );
}

interface SessionSummaryProps {
  summary: SessionSummary;
}

export function SessionSummary({ summary }: SessionSummaryProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Session Summary
      </h3>

      <div className="text-sm text-muted-foreground">
        {formatRoundSummary(summary)}
      </div>
    </div>
  );
}