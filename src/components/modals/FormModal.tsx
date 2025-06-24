'use client';

import * as React from 'react';
import { Modal } from './Modal';
import { FormWrapper, FormWrapperProps } from '@/components/forms/FormWrapper';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormModalProps extends Omit<FormWrapperProps, 'children'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  preventCloseOnSubmit?: boolean;
  resetOnClose?: boolean;
}

export function FormModal({
  open: _open,
  onOpenChange,
  title,
  description,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  showCancelButton = true,
  className,
  size = 'md',
  preventCloseOnSubmit = false,
  resetOnClose = true,
  onSubmit,
  isSubmitting,
  ...formProps
}: FormModalProps) {
  const [localIsSubmitting, setLocalIsSubmitting] = React.useState(false);

  const handleCancel = React.useCallback(() => {
    if (localIsSubmitting || isSubmitting) return;
    onCancel?.();
    onOpenChange(false);
  }, [localIsSubmitting, isSubmitting, onCancel, onOpenChange]);

  const handleSubmit = React.useCallback(
    async (data: any) => {
      if (!onSubmit) return;

      setLocalIsSubmitting(true);
      try {
        const result = await onSubmit(data);

        // Close modal unless specifically prevented
        if (!preventCloseOnSubmit) {
          onOpenChange(false);
        }

        return result;
      } finally {
        setLocalIsSubmitting(false);
      }
    },
    [onSubmit, preventCloseOnSubmit, onOpenChange]
  );

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // Prevent closing while submitting
      if (!newOpen && (localIsSubmitting || isSubmitting)) {
        return;
      }

      onOpenChange(newOpen);
    },
    [localIsSubmitting, isSubmitting, onOpenChange]
  );

  // Handle form reset when modal closes
  React.useEffect(() => {
    if (!_open && resetOnClose && formProps.reset) {
      // Small delay to ensure modal close animation completes
      const timer = setTimeout(() => {
        formProps.reset?.();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [_open, resetOnClose, formProps.reset]);

  const submitting = localIsSubmitting || isSubmitting;

  return (
    <Modal
      open={_open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      size={size}
      className={cn('', className)}
      closeOnOverlayClick={!submitting}
      closeOnEscapeKey={!submitting}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="mt-2 sm:mt-0"
            >
              {cancelText}
            </Button>
          )}
          <FormSubmitButton
            isSubmitting={submitting}
            className="w-full sm:w-auto"
          >
            {submitText}
          </FormSubmitButton>
        </div>
      }
    >
      <FormWrapper
        {...formProps}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        className="space-y-4"
      >
        {children}
      </FormWrapper>
    </Modal>
  );
}

// Hook for easier form modal usage
export function useFormModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<FormModalProps>>({});

  const openModal = React.useCallback(
    (modalConfig: Omit<FormModalProps, 'open' | 'onOpenChange'>) => {
      setConfig(modalConfig);
      setIsOpen(true);
    },
    []
  );

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const FormModalComponent = React.useCallback(
    () => (
      <FormModal
        {...(config as FormModalProps)}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    ),
    [isOpen, config]
  );

  return {
    isOpen,
    openModal,
    closeModal,
    FormModal: FormModalComponent,
  };
}

// Quick form modal variants for common use cases
export interface QuickFormModalProps extends Omit<FormModalProps, 'onSubmit'> {
  onSubmit: (data: any) => Promise<void> | void;
}

export function QuickAddModal(props: QuickFormModalProps) {
  return (
    <FormModal
      {...props}
      title={props.title || 'Add New Item'}
      submitText={props.submitText || 'Add'}
    />
  );
}

export function QuickEditModal(props: QuickFormModalProps) {
  const { data: _data, ...restProps } = props;
  return (
    <FormModal
      {...restProps}
      title={props.title || 'Edit Item'}
      submitText={props.submitText || 'Save Changes'}
    />
  );
}
