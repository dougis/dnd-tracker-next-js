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
    const errorMessage = typeof result.error === 'string' ? result.error : 'Operation failed';
    onError?.(result.error);
    throw new Error(errorMessage);
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
      
      toastFn({
        title: 'Success',
        description: successMessage,
      });
      
      return result;
    } catch (error: any) {
      toastFn({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
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
    console.log(`[Success] ${successMessage}`);
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