'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatRoundSummary } from '../round-utils';
import type { SessionSummary } from '../round-utils';

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