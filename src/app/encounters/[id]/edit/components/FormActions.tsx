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

// Button component helpers to reduce complexity
function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = 'outline' as const
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'default';
}) {
  return (
    <Button
      type={variant === 'default' ? 'submit' : 'button'}
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center space-x-2"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}

function SubmitButton({ onSubmit, isSubmitting, isValid }: {
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}) {
  return (
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
  );
}

// Status alert components
function StatusAlert({ children, variant = 'default', icon: Icon }: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Alert variant={variant}>
      {Icon && <Icon className="h-4 w-4" />}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

function ErrorsList({ errors }: { errors: Record<string, any> }) {
  return (
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
  );
}

function HelpText() {
  return (
    <div className="text-sm text-muted-foreground">
      <ul className="space-y-1">
        <li>• <strong>Save:</strong> Apply all changes to the encounter</li>
        <li>• <strong>Reset:</strong> Discard changes and restore original values</li>
        <li>• <strong>Cancel:</strong> Return to encounter detail without saving</li>
      </ul>
    </div>
  );
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
        <ActionButton icon={X} label="Cancel" onClick={onCancel} disabled={isSubmitting} />
        <ActionButton
          icon={RotateCcw}
          label="Reset"
          onClick={onReset}
          disabled={isSubmitting || !isDirty}
        />
        <SubmitButton onSubmit={onSubmit} isSubmitting={isSubmitting} isValid={isValid} />
      </div>

      {/* Status Messages */}
      {isSubmitting && (
        <StatusAlert icon={LoadingSpinner}>
          Saving encounter changes, please wait...
        </StatusAlert>
      )}

      {/* Validation Errors */}
      {hasErrors && !isSubmitting && (
        <StatusAlert variant="destructive" icon={AlertCircle}>
          <ErrorsList errors={errors} />
        </StatusAlert>
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

      <HelpText />
    </div>
  );
}