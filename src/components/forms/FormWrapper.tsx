'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormWrapperProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errors?: FormValidationError[];
  isSubmitting?: boolean;
  onSubmit?: (_event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  containerClassName?: string;
}

interface FormContextType {
  errors: FormValidationError[];
  isSubmitting: boolean;
  getFieldError: (_fieldName: string) => string | undefined;
}

const FormContext = React.createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormWrapper');
  }
  return context;
};

const FormWrapper = React.forwardRef<HTMLFormElement, FormWrapperProps>(
  (
    {
      children,
      errors = [],
      isSubmitting = false,
      onSubmit,
      containerClassName,
      className,
      ...props
    },
    ref
  ) => {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (onSubmit && !isSubmitting) {
        await onSubmit(event);
      }
    };

    const getFieldError = React.useCallback(
      (fieldName: string) => {
        const error = errors.find(err => err.field === fieldName);
        return error?.message;
      },
      [errors]
    );

    const contextValue = React.useMemo(
      () => ({
        errors,
        isSubmitting,
        getFieldError,
      }),
      [errors, isSubmitting, getFieldError]
    );

    return (
      <div className={cn('space-y-6', containerClassName)}>
        <FormContext.Provider value={contextValue}>
          <form
            ref={ref}
            onSubmit={handleSubmit}
            className={cn('space-y-4', className)}
            noValidate
            {...props}
          >
            <fieldset disabled={isSubmitting} className="space-y-4">
              {children}
            </fieldset>
          </form>
        </FormContext.Provider>
      </div>
    );
  }
);

FormWrapper.displayName = 'FormWrapper';

export { FormWrapper };
