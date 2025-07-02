import React from 'react';
import { Button } from '@/components/ui/button';

interface BatchActionsProps {
  selectedCount: number;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
}

export function BatchActions({ selectedCount, onDuplicateSelected, onDeleteSelected }: BatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-md">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicateSelected}
        >
          Duplicate Selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteSelected}
        >
          Delete Selected
        </Button>
      </div>
    </div>
  );
}