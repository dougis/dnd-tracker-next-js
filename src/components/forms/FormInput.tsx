'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            className,
            containerClassName,
            label,
            error,
            helperText,
            required,
            id,
            ...props
        },
        ref
    ) => {

        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className={cn('space-y-2', containerClassName)}>
                {label && (
                    <Label htmlFor={inputId} className="text-sm font-medium">
                        {label}
                        {required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                )}
                <Input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        error &&
              'border-destructive focus-visible:ring-destructive focus-visible:ring-2',
                        className
                    )}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={
                        error
                            ? `${inputId}-error`
                            : helperText
                                ? `${inputId}-helper`
                                : undefined
                    }
                    {...props}
                />
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="text-sm text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
                        {helperText}
                    </p>
                )}
            </div>
        );

    }
);

FormInput.displayName = 'FormInput';

export { FormInput };
