'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useFormContext } from './FormWrapper';

export interface FormSubmitButtonProps extends Omit<ButtonProps, 'type'> {
  children: React.ReactNode;
  loadingText?: string;
  showSpinner?: boolean;
}

const FormSubmitButton = React.forwardRef<
  HTMLButtonElement,
  FormSubmitButtonProps
>(({ children, loadingText, showSpinner = true, disabled, ...props }, ref) => {
  const { isSubmitting } = useFormContext();
  const isDisabled = disabled || isSubmitting;

  return (
    <Button ref={ref} type="submit" disabled={isDisabled} {...props}>
      {isSubmitting && showSpinner && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {isSubmitting ? loadingText || children : children}
    </Button>
  );
});

FormSubmitButton.displayName = 'FormSubmitButton';

export { FormSubmitButton };
