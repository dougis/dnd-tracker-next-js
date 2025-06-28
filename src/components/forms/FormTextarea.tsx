'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
        const textareaId = id || generatedId;

        return (
            <div className={cn('space-y-2', containerClassName)}>
                {label && (
                    <Label htmlFor={textareaId} className="text-sm font-medium">
                        {label}
                        {required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        error &&
              'border-destructive focus-visible:ring-destructive focus-visible:ring-2',
                        className
                    )}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={
                        error
                            ? `${textareaId}-error`
                            : helperText
                                ? `${textareaId}-helper`
                                : undefined
                    }
                    {...props}
                />
                {error && (
                    <p
                        id={`${textareaId}-error`}
                        className="text-sm text-destructive"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p
                        id={`${textareaId}-helper`}
                        className="text-sm text-muted-foreground"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );

    }
);

FormTextarea.displayName = 'FormTextarea';

export { FormTextarea };
