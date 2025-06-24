'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Modal variants for different sizes and types
const modalVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      type: {
        default: '',
        info: 'border-blue-200 dark:border-blue-800',
        warning: 'border-yellow-200 dark:border-yellow-800',
        error: 'border-red-200 dark:border-red-800',
        success: 'border-green-200 dark:border-green-800',
      },
    },
    defaultVariants: {
      size: 'md',
      type: 'default',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
}

export function Modal({
  open: _open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size,
  type,
  className,
  showCloseButton: _showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  ...props
}: ModalProps) {
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // Only allow closing if the respective close methods are enabled
      if (!newOpen && !closeOnOverlayClick && !closeOnEscapeKey) {
        return;
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, closeOnOverlayClick, closeOnEscapeKey]
  );

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeOnEscapeKey) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [closeOnEscapeKey]
  );

  React.useEffect(() => {
    if (_open && !closeOnEscapeKey) {
      document.addEventListener('keydown', handleKeyDown, {
        capture: true,
      });
      return () => {
        document.removeEventListener('keydown', handleKeyDown, {
          capture: true,
        });
      };
    }
  }, [_open, closeOnEscapeKey, handleKeyDown]);

  return (
    <Dialog open={_open} onOpenChange={handleOpenChange} {...props}>
      <DialogContent
        className={cn(modalVariants({ size, type }), className)}
        onPointerDownOutside={
          closeOnOverlayClick ? undefined : e => e.preventDefault()
        }
        onEscapeKeyDown={closeOnEscapeKey ? undefined : e => e.preventDefault()}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="flex-1 overflow-auto">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export type { VariantProps };
export { modalVariants };
