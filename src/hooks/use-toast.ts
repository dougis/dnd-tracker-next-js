'use client';

// TODO: Replace with proper toast implementation (e.g., react-hot-toast or shadcn/ui toast)
interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = `${title}${description ? ': ' + description : ''}`;

    if (variant === 'destructive') {
      console.error('[Toast Error]', message);
    } else {
      console.log('[Toast]', message);
    }

    // TODO: Replace with actual toast UI implementation
    // For now, we'll use browser alert as a fallback
    if (variant === 'destructive') {
      alert(`Error: ${message}`);
    }
  };

  return { toast };
}