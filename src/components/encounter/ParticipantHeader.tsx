'use client';

import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatchSelectionBar } from './BatchSelectionBar';

interface ParticipantHeaderProps {
  selectedCount: number;
  onBatchRemove: () => void;
  renderActions?: () => React.ReactNode;
}

export function ParticipantHeader({
  selectedCount,
  onBatchRemove,
  renderActions,
}: ParticipantHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Encounter Participants</CardTitle>
          <CardDescription>
            Manage characters and NPCs in this encounter
          </CardDescription>
        </div>
        {renderActions && (
          <div className="flex space-x-2">
            {renderActions()}
          </div>
        )}
      </div>

      <BatchSelectionBar
        selectedCount={selectedCount}
        onBatchRemove={onBatchRemove}
      />
    </CardHeader>
  );
}