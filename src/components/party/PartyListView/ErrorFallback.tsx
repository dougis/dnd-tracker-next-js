'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorFallbackProps {
  onRetry: () => void;
  error?: string;
}

export function ErrorFallback({ onRetry, error }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Parties</AlertTitle>
        <AlertDescription className="mt-2">
          {error || 'Something went wrong while loading your parties. Please try again.'}
        </AlertDescription>
        <div className="mt-4">
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Alert>
    </div>
  );
}