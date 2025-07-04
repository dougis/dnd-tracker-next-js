import React from 'react';
import { Button } from '@/components/ui/button';
import { PenIcon } from 'lucide-react';

interface DescriptionDisplayProps {
  description?: string;
  onEdit: () => void;
}

/**
 * Display encounter description with edit button
 */
export function DescriptionDisplay({ description }: DescriptionDisplayProps) {
  return (
    <div>
      {description ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No description provided. Click Edit to add one.
        </p>
      )}
    </div>
  );
}

interface DescriptionHeaderProps {
  onEdit: () => void;
}

/**
 * Header with edit button for description section
 */
export function DescriptionHeader({ onEdit }: DescriptionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold">Description</span>
      <Button variant="outline" size="sm" onClick={onEdit}>
        <PenIcon className="h-4 w-4 mr-1" />
        Edit
      </Button>
    </div>
  );
}