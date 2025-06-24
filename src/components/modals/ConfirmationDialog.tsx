'use client';

import * as React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function ConfirmationDialog({
  open: _open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  children,
  className,
}: ConfirmationDialogProps) {
  const handleCancel = React.useCallback(() => {
    if (loading) return;
    onCancel?.();
    onOpenChange(false);
  }, [loading, onCancel, onOpenChange]);

  const handleConfirm = React.useCallback(() => {
    if (loading) return;
    onConfirm();
  }, [loading, onConfirm]);

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return (
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        );
      case 'warning':
        return (
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        );
      default:
        return <Check className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getModalType = () => {
    switch (variant) {
      case 'destructive':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      type={getModalType()}
      className={cn('', className)}
      closeOnOverlayClick={!loading}
      closeOnEscapeKey={!loading}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="mt-2 sm:mt-0"
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}

// Hook for easier confirmation dialog usage
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<ConfirmationDialogProps>>(
    {}
  );

  const confirm = React.useCallback(
    (props: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>) => {
      return new Promise<boolean>(resolve => {
        setConfig({
          ...props,
          onConfirm: () => {
            props.onConfirm();
            setIsOpen(false);
            resolve(true);
          },
          onCancel: () => {
            props.onCancel?.();
            setIsOpen(false);
            resolve(false);
          },
        });
        setIsOpen(true);
      });
    },
    []
  );

  const ConfirmationDialogComponent = React.useCallback(
    () => (
      <ConfirmationDialog
        {...(config as ConfirmationDialogProps)}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    ),
    [isOpen, config]
  );

  return {
    confirm,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}
