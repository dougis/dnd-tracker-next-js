'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ParticipantStats {
  total: number;
  pcs: number;
  npcs: number;
}

interface CombatStatusProps {
  participantStats: ParticipantStats;
  activeParticipantName?: string;
  combatPhase: 'active' | 'paused' | 'inactive';
}

export function CombatStatus({
  participantStats,
  activeParticipantName,
  combatPhase,
}: CombatStatusProps) {
  const badgeVariant = combatPhase === 'active' ? 'default' : combatPhase === 'paused' ? 'secondary' : 'outline';
  const phaseLabel = combatPhase === 'active' ? 'Combat Active' : combatPhase === 'paused' ? 'Combat Paused' : 'Combat Inactive';

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center space-x-4">
        <span>Participants: {participantStats.total}</span>
        <span>PCs: {participantStats.pcs}</span>
        <span>NPCs: {participantStats.npcs}</span>
      </div>
      <div className="flex items-center space-x-4">
        {activeParticipantName && (
          <span>Active: {activeParticipantName}</span>
        )}
        <Badge variant={badgeVariant}>
          {phaseLabel}
        </Badge>
      </div>
    </div>
  );
}