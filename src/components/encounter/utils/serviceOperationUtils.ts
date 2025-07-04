// Generic service operation handler with external toast function
export const createServiceOperationHandler = (toastFn: any) => {
  return async <T>(
    operation: () => Promise<{ success: boolean; data?: T; error?: any }>,
    successMessage: string,
    onSuccess: (_data?: T) => void,
    onError?: (_error: any) => void
  ) => {
    try {
      const result = await operation();

      if (result.success) {
        toastFn({
          title: 'Success',
          description: successMessage,
        });
        onSuccess(result.data);
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Operation failed';
        toastFn({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        onError?.(result.error);
      }
      return result;
    } catch (error) {
      toastFn({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error('Service operation error:', error);
      onError?.(error);
      throw error;
    }
  };
};

// Legacy function for compatibility - creates a basic handler
export const handleServiceOperation = async <T>(
  operation: () => Promise<{ success: boolean; data?: T; error?: any }>,
  successMessage: string,
  onSuccess: (_data?: T) => void,
  onError?: (_error: any) => void
) => {
  try {
    const result = await operation();

    if (result.success) {
      console.log(`[Success] ${successMessage}`);
      onSuccess(result.data);
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : 'Operation failed';
      console.error(`[Error] ${errorMessage}`);
      onError?.(result.error);
    }
    return result;
  } catch (error) {
    console.error('[Error] An unexpected error occurred:', error);
    onError?.(error);
    throw error;
  }
};

// Simplified loading state manager
export const createLoadingManager = () => {
  let isLoading = false;
  return {
    getState: () => isLoading,
    wrap: async <T>(operation: () => Promise<T>): Promise<T> => {
      isLoading = true;
      try {
        return await operation();
      } finally {
        isLoading = false;
      }
    }
  };
};