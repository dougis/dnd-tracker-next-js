'use client';

import { toast } from 'sonner';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const showToast = ({ title, description, variant, duration, action }: ToastProps) => {
    const options: any = {};

    if (description !== undefined && description !== null) {
      options.description = description;
    }

    if (duration !== undefined && duration !== null) {
      options.duration = duration;
    }

    if (action) {
      options.action = action;
    }

    const hasOptions = Object.keys(options).length > 0;

    if (variant === 'destructive') {
      if (hasOptions) {
        toast.error(title, options);
      } else {
        toast.error(title);
      }
    } else if (variant === 'default') {
      if (hasOptions) {
        toast.success(title, options);
      } else {
        toast.success(title);
      }
    } else {
      // For undefined variant or unknown variants, use base toast
      if (hasOptions) {
        toast(title, options);
      } else {
        toast(title);
      }
    }
  };

  const dismiss = (id?: string) => {
    if (id !== undefined) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  return {
    toast: showToast,
    dismiss
  };
}