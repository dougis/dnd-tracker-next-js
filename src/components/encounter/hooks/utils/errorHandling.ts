export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const handleServiceError = (result: any): string => {
  if (typeof result.error === 'string') {
    return result.error;
  }
  return 'Failed to fetch encounters';
};