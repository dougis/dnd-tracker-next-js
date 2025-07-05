import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Error display component for encounter detail page
 */
export function ErrorDisplay({ title, message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}