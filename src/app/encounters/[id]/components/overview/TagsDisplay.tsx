import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TagsDisplayProps {
  tags?: string[];
}

/**
 * Display encounter tags as badges
 */
export function TagsDisplay({ tags }: TagsDisplayProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}