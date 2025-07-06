'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IInitiativeEntry, IParticipantReference } from '@/lib/models/encounter/interfaces';

interface InitiativeBadgeProps {
  initiative: number;
  isActive: boolean;
}

export function InitiativeBadge({ initiative, isActive }: InitiativeBadgeProps) {
  return (
    <div
      className={`text-lg font-bold px-2 py-1 rounded ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {initiative}
    </div>
  );
}

interface CharacterInfoProps {
  participant: IParticipantReference;
  entry: IInitiativeEntry;
  isActive: boolean;
}

export function CharacterInfo({ participant, entry, isActive }: CharacterInfoProps) {
  return (
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
          <ConditionsList conditions={participant.conditions} />
        )}
      </div>
    </div>
  );
}

interface ConditionsListProps {
  conditions: string[];
}

function ConditionsList({ conditions }: ConditionsListProps) {
  return (
    <div className="flex items-center space-x-1">
      {conditions.map(condition => (
        <Badge key={condition} variant="destructive" className="text-xs">
          {condition}
        </Badge>
      ))}
    </div>
  );
}

interface HPDisplayProps {
  participant: IParticipantReference;
}

export function HPDisplay({ participant }: HPDisplayProps) {
  const hpPercentage = (participant.currentHitPoints / participant.maxHitPoints) * 100;
  const isInjured = hpPercentage < 100;
  const isCritical = hpPercentage <= 25;

  return (
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
  );
}

interface CardContainerProps {
  isActive: boolean;
  isNext: boolean;
  children: React.ReactNode;
}

export function CardContainer({ isActive, isNext, children }: CardContainerProps) {
  const getCardClassName = () => {
    const baseClass = 'p-3 rounded-lg border transition-all';

    if (isActive) {
      return `${baseClass} border-primary bg-primary/5 shadow-md`;
    }

    if (isNext) {
      return `${baseClass} border-amber-200 bg-amber-50`;
    }

    return `${baseClass} border-border bg-card`;
  };

  return <div className={getCardClassName()}>{children}</div>;
}