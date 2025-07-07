'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface CombatTimerProps {
  formattedDuration: string;
  hasRoundTimer: boolean;
  formattedRoundTime: string;
  isRoundWarning: boolean;
  isRoundCritical: boolean;
  isPaused: boolean;
}

export function CombatTimer({
  formattedDuration,
  hasRoundTimer,
  formattedRoundTime,
  isRoundWarning,
  isRoundCritical,
  isPaused,
}: CombatTimerProps) {
  const getRoundTimerClass = () => {
    if (isRoundCritical) return 'text-destructive';
    if (isRoundWarning) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4" />
        <span aria-label={`Combat duration: ${formattedDuration.replace(':', ' minutes ')}`}>
          {isPaused ? 'Paused' : formattedDuration}
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
  );
}