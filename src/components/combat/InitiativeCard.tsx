'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IInitiativeEntry, IParticipantReference } from '@/lib/models/encounter/interfaces';

interface InitiativeCardProps {
  entry: IInitiativeEntry;
  participant: IParticipantReference;
  isActive: boolean;
  isNext: boolean;
  onEditInitiative?: (_participantId: string, _newInitiative: number) => void;
  onDelayAction?: (_participantId: string) => void;
  onReadyAction?: (_participantId: string, _triggerCondition: string) => void;
}

export function InitiativeCard({
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