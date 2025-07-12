import { renderHook, act } from '@testing-library/react';

// Create the mock object inline to avoid hoisting issues
jest.mock('sonner', () => {
  const mockToastBase = jest.fn();
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();
  const mockToastDismiss = jest.fn();

  return {
    toast: Object.assign(mockToastBase, {
      success: mockToastSuccess,
      error: mockToastError,
      dismiss: mockToastDismiss,
    }),
  };
});

// Import after mocking
import { useToast } from '../use-toast';

// Get the mocked toast from the module
const { toast: mockToast } = jest.requireMock('sonner');
const mockToastBase = mockToast;
const mockToastSuccess = mockToast.success;
const mockToastError = mockToast.error;
const mockToastDismiss = mockToast.dismiss;

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook API', () => {
    it('returns toast function', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('toast');
      expect(typeof result.current.toast).toBe('function');
    });

    it('returns dismiss function', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('dismiss');
      expect(typeof result.current.dismiss).toBe('function');
    });
  });

  describe('Basic Toast Functionality', () => {
    it('shows default toast with title only', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test message'
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Test message');
    });

    it('shows toast with title and description', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test message',
          description: 'Additional details'
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Test message', {
        description: 'Additional details'
      });
    });

    it('handles empty or undefined title', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: ''
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('');

      act(() => {
        result.current.toast({
          title: undefined as any
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Toast Variants', () => {
    it('shows success toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Success message',
          variant: 'default'
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Success message');
    });

    it('shows error toast for destructive variant', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Error message',
          variant: 'destructive'
        });
      });

      expect(mockToastError).toHaveBeenCalledWith('Error message');
    });

    it('shows success toast with description', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Success message',
          description: 'Operation completed',
          variant: 'default'
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Success message', {
        description: 'Operation completed'
      });
    });

    it('shows error toast with description', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Error message',
          description: 'Something went wrong',
          variant: 'destructive'
        });
      });

      expect(mockToastError).toHaveBeenCalledWith('Error message', {
        description: 'Something went wrong'
      });
    });

    it('defaults to success variant when variant is undefined', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Default message'
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Default message');
    });
  });

  describe('Toast Duration', () => {
    it('applies custom duration when provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Timed message',
          duration: 5000
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Timed message', {
        duration: 5000
      });
    });

    it('applies duration with description', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Timed message',
          description: 'With details',
          duration: 3000
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Timed message', {
        description: 'With details',
        duration: 3000
      });
    });

    it('applies duration with variant', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Error message',
          variant: 'destructive',
          duration: 10000
        });
      });

      expect(mockToastError).toHaveBeenCalledWith('Error message', {
        duration: 10000
      });
    });
  });

  describe('Toast Actions', () => {
    it('applies action configuration when provided', () => {
      const actionFn = jest.fn();
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Action message',
          action: {
            label: 'Undo',
            onClick: actionFn
          }
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Action message', {
        action: {
          label: 'Undo',
          onClick: actionFn
        }
      });
    });

    it('applies action with other properties', () => {
      const actionFn = jest.fn();
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Complex message',
          description: 'With action and duration',
          variant: 'default',
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: actionFn
          }
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Complex message', {
        description: 'With action and duration',
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: actionFn
        }
      });
    });
  });

  describe('Toast Dismissal', () => {
    it('dismisses specific toast by id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss('toast-123');
      });

      expect(mockToastDismiss).toHaveBeenCalledWith('toast-123');
    });

    it('dismisses all toasts when no id provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss();
      });

      expect(mockToastDismiss).toHaveBeenCalledWith();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing toast properties gracefully', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({} as any);
      });

      expect(mockToastBase).toHaveBeenCalledWith(undefined);
    });

    it('handles null values in toast properties', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Test',
          description: null as any,
          variant: null as any,
          duration: null as any
        });
      });

      // Should filter out null values but keep valid ones
      expect(mockToastBase).toHaveBeenCalledWith('Test');
    });

    it('handles multiple rapid toast calls', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: 'First' });
        result.current.toast({ title: 'Second' });
        result.current.toast({ title: 'Third' });
      });

      expect(mockToastBase).toHaveBeenCalledTimes(3);
      expect(mockToastBase).toHaveBeenNthCalledWith(1, 'First');
      expect(mockToastBase).toHaveBeenNthCalledWith(2, 'Second');
      expect(mockToastBase).toHaveBeenNthCalledWith(3, 'Third');
    });
  });

  describe('Sonner Integration', () => {
    it('properly maps to Sonner API for success variant', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Success',
          description: 'All good',
          variant: 'default'
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Success', {
        description: 'All good'
      });
      expect(mockToastBase).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('properly maps to Sonner API for error variant', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Error',
          description: 'Something failed',
          variant: 'destructive'
        });
      });

      expect(mockToastError).toHaveBeenCalledWith('Error', {
        description: 'Something failed'
      });
      expect(mockToastBase).not.toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });

    it('uses base toast function for unknown variants', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({
          title: 'Unknown variant',
          variant: 'unknown' as any
        });
      });

      expect(mockToastBase).toHaveBeenCalledWith('Unknown variant');
      expect(mockToastSuccess).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  describe('Backwards Compatibility', () => {
    it('maintains API compatibility with old implementation', () => {
      const { result } = renderHook(() => useToast());

      // Should work with the exact same API as before
      act(() => {
        result.current.toast({
          title: 'Test message',
          description: 'Test description',
          variant: 'destructive'
        });
      });

      expect(mockToastError).toHaveBeenCalledWith('Test message', {
        description: 'Test description'
      });
    });

    it('preserves existing interface structure', () => {
      const { result } = renderHook(() => useToast());

      // Should have the same shape as before
      expect(result.current).toMatchObject({
        toast: expect.any(Function),
        dismiss: expect.any(Function)
      });
    });
  });
});