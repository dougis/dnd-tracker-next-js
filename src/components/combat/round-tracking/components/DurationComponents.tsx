'use client';

import React from 'react';
import { formatDuration } from '../round-utils';

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