import React from 'react';
import { Button } from '@/components/ui/button';
import type { ViewMode } from './constants';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (_mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        aria-label="Grid view"
      >
        Grid
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        aria-label="Table view"
      >
        Table
      </Button>
    </div>
  );
}