export interface ToastFunction {
  (_options: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
  }): void;
}

export const createErrorHandler = (toast?: ToastFunction) => {
  return (action: string, _encounterName: string) => {
    toast?.({
      title: 'Error',
      description: `Failed to ${action} encounter. Please try again.`,
      variant: 'destructive',
    });
  };
};

export const createSuccessHandler = (toast?: ToastFunction) => {
  return (action: string, encounterName: string) => {
    const messages = {
      duplicate: `"${encounterName}" has been duplicated successfully.`,
      delete: `"${encounterName}" has been deleted.`,
    };

    toast?.({
      title: `Encounter ${action}d`,
      description: messages[action as keyof typeof messages] || `Encounter ${action}d successfully.`,
    });
  };
};

export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};