'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Trigger, formatTimeUntilTrigger } from '../round-utils';

interface TriggersSectionProps {
  dueTriggers: Trigger[];
  upcomingTriggers: Trigger[];
  triggers: Trigger[];
  currentRound: number;
  duration: { average: number };
  onTriggerAction?: (_triggerId: string) => void;
}

// Helper components to reduce complexity
function DueTriggerItem({ trigger, onActivate }: { trigger: Trigger; onActivate: (_id: string) => void }) {
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
      <TriggersSectionHeader />
      <TriggersSectionContent 
        dueTriggers={dueTriggers}
        upcomingTriggers={upcomingTriggers}
        triggers={triggers}
        currentRound={currentRound}
        duration={duration}
        onTriggerActivation={handleTriggerActivation}
        hasCompletedTriggers={hasCompletedTriggers}
      />
    </div>
  );
}

function TriggersSectionHeader() {
  return (
    <h3 className="font-medium text-sm flex items-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      Triggers & Reminders
    </h3>
  );
}

function TriggersSectionContent({
  dueTriggers,
  upcomingTriggers,
  triggers,
  currentRound,
  duration,
  onTriggerActivation,
  hasCompletedTriggers,
}: {
  dueTriggers: Trigger[];
  upcomingTriggers: Trigger[];
  triggers: Trigger[];
  currentRound: number;
  duration: { average: number };
  onTriggerActivation: (triggerId: string) => void;
  hasCompletedTriggers: boolean;
}) {
  return (
    <>
      <DueTriggersSection dueTriggers={dueTriggers} onTriggerActivation={onTriggerActivation} />
      <UpcomingTriggersSection 
        upcomingTriggers={upcomingTriggers} 
        currentRound={currentRound} 
        duration={duration} 
      />
      <CompletedTriggersSection 
        triggers={triggers} 
        hasCompletedTriggers={hasCompletedTriggers} 
      />
    </>
  );
}

function DueTriggersSection({ dueTriggers, onTriggerActivation }: {
  dueTriggers: Trigger[];
  onTriggerActivation: (triggerId: string) => void;
}) {
  if (dueTriggers.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400">
        Due This Round
      </h4>
      {dueTriggers.map((trigger) => (
        <DueTriggerItem
          key={trigger.id}
          trigger={trigger}
          onActivate={onTriggerActivation}
        />
      ))}
    </div>
  );
}

function UpcomingTriggersSection({ upcomingTriggers, currentRound, duration }: {
  upcomingTriggers: Trigger[];
  currentRound: number;
  duration: { average: number };
}) {
  if (upcomingTriggers.length === 0) return null;

  return (
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
  );
}

function CompletedTriggersSection({ triggers, hasCompletedTriggers }: {
  triggers: Trigger[];
  hasCompletedTriggers: boolean;
}) {
  if (!hasCompletedTriggers) return null;

  return (
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
  );
}