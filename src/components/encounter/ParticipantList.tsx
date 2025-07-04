'use client';

import React from 'react';
import type { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { ParticipantItem } from './ParticipantItem';

interface ParticipantListProps {
  participants: IParticipantReference[];
  selectedParticipants: Set<string>;
  onSelectionChange: (_participantId: string, _checked: boolean) => void;
  onEdit: (_participant: IParticipantReference) => void;
  onRemove: (_participantId: string) => void;
}

export function ParticipantList({
  participants,
  selectedParticipants,
  onSelectionChange,
  onEdit,
  onRemove,
}: ParticipantListProps) {
  return (
    <div className="space-y-4">
      {participants.map((participant) => (
        <ParticipantItem
          key={participant.characterId.toString()}
          participant={participant}
          isSelected={selectedParticipants.has(participant.characterId.toString())}
          onSelectionChange={onSelectionChange}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}