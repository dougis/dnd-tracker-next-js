// Core service operation logic
const executeServiceOperation = async <T>(
  operation: () => Promise<{ success: boolean; data?: T; error?: any }>,
  onSuccess: (_data?: T) => void,
  onError?: (_error: any) => void
) => {
  const result = await operation();

  if (result.success) {
    onSuccess(result.data);
  } else {
    onError?.(result.error);
  }

  return result;
};

// Generic service operation handler with external toast function
export const createServiceOperationHandler = (toastFn: any) => {
  return async <T>(
    operation: () => Promise<{ success: boolean; data?: T; error?: any }>,
    successMessage: string,
    onSuccess: (_data?: T) => void,
    onError?: (_error: any) => void
  ) => {
    try {
      const result = await executeServiceOperation(operation, onSuccess, onError);

      if (result.success) {
        toastFn({
          title: 'Success',
          description: successMessage,
        });
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : 'An unexpected error occurred';
        toastFn({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      return result;
    } catch (error: any) {
      toastFn({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error('Service operation error:', error);
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
    const result = await executeServiceOperation(operation, onSuccess, onError);

    if (result.success) {
      console.log(`[Success] ${successMessage}`);
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : 'An unexpected error occurred';
      console.error(`[Error] ${errorMessage}`);
    }

    return result;
  } catch (error: any) {
    console.error(`[Error] ${error.message || 'An unexpected error occurred'}`);
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