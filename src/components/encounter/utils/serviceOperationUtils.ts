import { toast } from 'sonner';

// Generic service operation handler
export const handleServiceOperation = async <T>(
  operation: () => Promise<{ success: boolean; data?: T; error?: any }>,
  successMessage: string,
  onSuccess: (_data?: T) => void,
  onError?: (_error: any) => void
) => {
  try {
    const result = await operation();

    if (result.success) {
      toast.success(successMessage);
      onSuccess(result.data);
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : 'Operation failed';
      toast.error(errorMessage);
      onError?.(result.error);
    }
    return result;
  } catch (error) {
    toast.error('An unexpected error occurred');
    console.error('Service operation error:', error);
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