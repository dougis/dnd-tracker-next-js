'use client';

// TODO: Replace with proper toast implementation (e.g., react-hot-toast or shadcn/ui toast)
interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const formatMessage = (title: string, description?: string): string => {
  return `${title}${description ? ': ' + description : ''}`;
};

const logMessage = (message: string, isError: boolean): void => {
  if (isError) {
    console.error('[Toast Error]', message);
  } else {
    console.log('[Toast]', message);
  }
};

const showAlert = (message: string, isError: boolean): void => {
  if (isError) {
    alert(`Error: ${message}`);
  }
};

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = formatMessage(title, description);
    const isError = variant === 'destructive';

    logMessage(message, isError);
    showAlert(message, isError);
  };

  return { toast };
}