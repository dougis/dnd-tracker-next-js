import {
  createErrorHandler,
  createSuccessHandler,
  extractErrorMessage,
  type ToastFunction,
} from '../errorUtils';

describe('Error Utils', () => {
  const mockToast: ToastFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createErrorHandler', () => {
    it('should create error handler that calls toast with error message', () => {
      const errorHandler = createErrorHandler(mockToast);

      errorHandler('delete', 'Test Encounter');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete encounter. Please try again.',
        variant: 'destructive',
      });
    });

    it('should work with different actions', () => {
      const errorHandler = createErrorHandler(mockToast);

      errorHandler('duplicate', 'Another Encounter');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to duplicate encounter. Please try again.',
        variant: 'destructive',
      });
    });

    it('should handle missing toast function gracefully', () => {
      const errorHandler = createErrorHandler();

      expect(() => {
        errorHandler('delete', 'Test Encounter');
      }).not.toThrow();
    });

    it('should handle undefined toast function', () => {
      const errorHandler = createErrorHandler(undefined);

      expect(() => {
        errorHandler('archive', 'Test Encounter');
      }).not.toThrow();
    });
  });

  describe('createSuccessHandler', () => {
    it('should create success handler with predefined messages', () => {
      const successHandler = createSuccessHandler(mockToast);

      successHandler('duplicate', 'Test Encounter');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Encounter duplicated',
        description: '"Test Encounter" has been duplicated successfully.',
      });
    });

    it('should handle delete action', () => {
      const successHandler = createSuccessHandler(mockToast);

      successHandler('delete', 'Test Encounter');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Encounter deleted',
        description: '"Test Encounter" has been deleted.',
      });
    });

    it('should provide default message for unknown actions', () => {
      const successHandler = createSuccessHandler(mockToast);

      successHandler('archive', 'Test Encounter');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Encounter archived',
        description: 'Encounter archived successfully.',
      });
    });

    it('should handle missing toast function gracefully', () => {
      const successHandler = createSuccessHandler();

      expect(() => {
        successHandler('duplicate', 'Test Encounter');
      }).not.toThrow();
    });

    it('should handle undefined toast function', () => {
      const successHandler = createSuccessHandler(undefined);

      expect(() => {
        successHandler('delete', 'Test Encounter');
      }).not.toThrow();
    });

    it('should handle custom actions with fallback message', () => {
      const successHandler = createSuccessHandler(mockToast);

      successHandler('export', 'Test Encounter');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Encounter exportd',
        description: 'Encounter exportd successfully.',
      });
    });
  });

  describe('extractErrorMessage', () => {
    it('should return string errors as-is', () => {
      expect(extractErrorMessage('Simple error message')).toBe('Simple error message');
    });

    it('should extract message from error objects', () => {
      const error = new Error('Test error message');
      expect(extractErrorMessage(error)).toBe('Test error message');
    });

    it('should extract message from custom error objects', () => {
      const customError = { message: 'Custom error message', code: 'ERR001' };
      expect(extractErrorMessage(customError)).toBe('Custom error message');
    });

    it('should provide default message for unknown error types', () => {
      expect(extractErrorMessage(null)).toBe('An unexpected error occurred');
      expect(extractErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(extractErrorMessage({})).toBe('An unexpected error occurred');
      expect(extractErrorMessage(42)).toBe('An unexpected error occurred');
    });

    it('should handle errors with empty message', () => {
      const error = { message: '' };
      expect(extractErrorMessage(error)).toBe('An unexpected error occurred');
    });

    it('should handle nested error structures', () => {
      const complexError = {
        response: {
          data: {
            message: 'Nested error message'
          }
        },
        message: 'Top level message'
      };
      expect(extractErrorMessage(complexError)).toBe('Top level message');
    });
  });
});