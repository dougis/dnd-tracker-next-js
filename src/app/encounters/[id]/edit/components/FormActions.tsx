'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Save, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  onReset: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors?: Record<string, any>;
}

export function FormActions({
  onSubmit,
  onCancel,
  onReset,
  isSubmitting,
  isValid,
  isDirty,
  errors = {},
}: FormActionsProps) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isSubmitting || !isDirty}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </Button>

        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className="flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Encounter</span>
            </>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {isSubmitting && (
        <Alert>
          <LoadingSpinner size="sm" />
          <AlertDescription>
            Saving encounter changes, please wait...
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {hasErrors && !isSubmitting && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {typeof error === 'object' && error?.message
                      ? error.message
                      : `${field}: ${String(error)}`}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Indicators */}
      {isValid && isDirty && !hasErrors && !isSubmitting && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Form is valid and ready to save.
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-sm text-muted-foreground">
        <ul className="space-y-1">
          <li>• <strong>Save:</strong> Apply all changes to the encounter</li>
          <li>• <strong>Reset:</strong> Discard changes and restore original values</li>
          <li>• <strong>Cancel:</strong> Return to encounter detail without saving</li>
        </ul>
      </div>
    </div>
  );
}