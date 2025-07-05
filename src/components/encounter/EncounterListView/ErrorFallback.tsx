import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  onRetry: () => void;
}

export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Failed to load encounters</p>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}