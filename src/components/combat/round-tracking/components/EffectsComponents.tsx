'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap } from 'lucide-react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { Effect } from '../round-utils';
import {
  findParticipantName,
  calculateEffectRemaining,
  getEffectClassName,
} from '../tracker-utils';

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
      <EffectItemContent effect={effect} />
      <EffectItemStatus remaining={remaining} isExpiring={isExpiring} />
    </div>
  );
}

function EffectItemContent({ effect }: { effect: Effect }) {
  return (
    <div className="flex-1">
      <div className="font-medium text-sm">{effect.name}</div>
      <div className="text-xs text-muted-foreground">
        {effect.description}
      </div>
    </div>
  );
}

function EffectItemStatus({ remaining, isExpiring }: { remaining: number; isExpiring: boolean }) {
  return (
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
      <EffectsSectionHeader effectsCount={effects.length} />
      <EffectsSectionContent 
        effectsError={effectsError}
        effectsByParticipant={effectsByParticipant}
        encounter={encounter}
        currentRound={currentRound}
      />
    </div>
  );
}

function EffectsSectionHeader({ effectsCount }: { effectsCount: number }) {
  return (
    <h3 className="font-medium text-sm flex items-center gap-2">
      <Zap className="h-4 w-4" />
      Active Effects
      {effectsCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {effectsCount}
        </Badge>
      )}
    </h3>
  );
}

function EffectsSectionContent({ 
  effectsError, 
  effectsByParticipant, 
  encounter, 
  currentRound 
}: {
  effectsError?: string;
  effectsByParticipant: Record<string, Effect[]>;
  encounter: IEncounter | null;
  currentRound: number;
}) {
  return (
    <>
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
    </>
  );
}