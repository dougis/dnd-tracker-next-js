import React from 'react';

interface DescriptionDisplayProps {
  description?: string;
}

/**
 * Display encounter description section
 */
export function DescriptionDisplay({ description }: DescriptionDisplayProps) {
  if (!description) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
      <p className="text-sm leading-relaxed">{description}</p>
    </div>
  );
}