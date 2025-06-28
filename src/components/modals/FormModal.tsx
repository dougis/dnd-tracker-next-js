'use client';

import * as React from 'react';
import { Modal } from './Modal';
import { FormWrapper, FormWrapperProps } from '@/components/forms/FormWrapper';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormModalConfig {
  title: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  preventCloseOnSubmit?: boolean;
  resetOnClose?: boolean;
}

export interface FormModalProps extends Omit<FormWrapperProps, 'children'> {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  children: React.ReactNode;
  onCancel?: () => void;
  config: FormModalConfig;
}

export function FormModal({
  open: _open,
  onOpenChange,
  children,
  onCancel,
  config,
  onSubmit,
  isSubmitting,
  ...formProps
}: FormModalProps) {
  const {
    title,
    description,
    submitText = 'Submit',
    cancelText = 'Cancel',
    showCancelButton = true,
    className,
    size = 'md',
    preventCloseOnSubmit = false,
    resetOnClose = true,
  } = config;
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
    if (
      !_open &&
      resetOnClose &&
      'reset' in formProps &&
      typeof (formProps as any).reset === 'function'
    ) {
      // Small delay to ensure modal close animation completes
      const timer = setTimeout(() => {
        (formProps as any).reset?.();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [_open, resetOnClose, formProps]);

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
          <FormSubmitButton className="w-full sm:w-auto">
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
  const [modalConfig, setModalConfig] = React.useState<
    Omit<FormModalProps, 'open' | 'onOpenChange'>
  >({
    children: null,
    config: { title: '' },
  });

  const openModal = React.useCallback(
    (config: Omit<FormModalProps, 'open' | 'onOpenChange'>) => {
      setModalConfig(config);
      setIsOpen(true);
    },
    []
  );

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const FormModalComponent = React.useCallback(
    () => <FormModal {...modalConfig} open={isOpen} onOpenChange={setIsOpen} />,
    [isOpen, modalConfig]
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
  onSubmit: (_data: any) => Promise<void> | void;
}

export function QuickAddModal(props: QuickFormModalProps) {
  const updatedConfig = {
    ...props.config,
    title: props.config.title || 'Add New Item',
    submitText: props.config.submitText || 'Add',
  };

  return <FormModal {...props} config={updatedConfig} />;
}

export function QuickEditModal(props: QuickFormModalProps) {
  const updatedConfig = {
    ...props.config,
    title: props.config.title || 'Edit Item',
    submitText: props.config.submitText || 'Save Changes',
  };

  return <FormModal {...props} config={updatedConfig} />;
}
