'use client';

import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'table';

interface ViewModeToggleProps {
  value: ViewMode;
  onValueChange: (_mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onValueChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={value === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onValueChange('grid')}
        aria-label="Grid view"
        className="rounded-r-none"
      >
        Grid
      </Button>
      <Button
        variant={value === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onValueChange('table')}
        aria-label="Table view"
        className="rounded-l-none"
      >
        Table
      </Button>
    </div>
  );
}