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

// Helper function to build options object
const buildToastOptions = (description?: string, duration?: number, action?: ToastProps['action']) => {
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

  return Object.keys(options).length > 0 ? options : undefined;
};

// Helper function to call appropriate toast method
const callToastMethod = (variant: ToastProps['variant'], title: string, options?: any) => {
  const toastMethod = variant === 'destructive' ? toast.error :
                     variant === 'default' ? toast.success :
                     toast;

  return options ? toastMethod(title, options) : toastMethod(title);
};

export function useToast() {
  const showToast = ({ title, description, variant, duration, action }: ToastProps) => {
    const options = buildToastOptions(description, duration, action);
    callToastMethod(variant, title, options);
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