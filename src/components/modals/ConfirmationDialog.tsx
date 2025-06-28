'use client';

import * as React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmationDialogConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  config: ConfirmationDialogConfig;
}

export function ConfirmationDialog({
  open: _open,
  onOpenChange,
  onConfirm,
  onCancel,
  config,
}: ConfirmationDialogProps) {
  const {
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    loading = false,
    children,
    className,
  } = config;
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
      open={_open}
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
  const [confirmProps, setConfirmProps] = React.useState<{
    onConfirm: () => void;
    onCancel?: () => void;
    config: ConfirmationDialogConfig;
  }>({
    onConfirm: () => {},
    config: { title: '', description: '' },
  });

  const confirm = React.useCallback(
    (
      dialogConfig: ConfirmationDialogConfig & {
        onConfirm: () => void;
        onCancel?: () => void;
      }
    ) => {
      return new Promise<boolean>(resolve => {
        const { onConfirm, onCancel, ...config } = dialogConfig;
        setConfirmProps({
          config,
          onConfirm: () => {
            onConfirm();
            setIsOpen(false);
            resolve(true);
          },
          onCancel: () => {
            onCancel?.();
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
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={confirmProps.onConfirm}
        onCancel={confirmProps.onCancel}
        config={confirmProps.config}
      />
    ),
    [isOpen, confirmProps]
  );

  return {
    confirm,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}
