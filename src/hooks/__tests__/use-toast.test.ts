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

// Test utilities to reduce code duplication
const setupToastHook = () => renderHook(() => useToast());

const actWithToast = (result: any, toastProps: any) => {
  act(() => {
    result.current.toast(toastProps);
  });
};

const expectToastCall = (mockFn: jest.Mock, title: string, options?: any) => {
  if (options) {
    expect(mockFn).toHaveBeenCalledWith(title, options);
  } else {
    expect(mockFn).toHaveBeenCalledWith(title);
  }
};

// Data-driven test cases to reduce duplication
const basicToastCases = [
  { description: 'shows default toast with title only', props: { title: 'Test message' }, expectedMock: mockToastBase, expectedTitle: 'Test message' },
  { description: 'shows toast with title and description', props: { title: 'Test message', description: 'Additional details' }, expectedMock: mockToastBase, expectedTitle: 'Test message', expectedOptions: { description: 'Additional details' } },
  { description: 'handles empty title', props: { title: '' }, expectedMock: mockToastBase, expectedTitle: '' },
];

const variantCases = [
  { description: 'shows success toast', props: { title: 'Success', variant: 'default' }, expectedMock: mockToastSuccess, expectedTitle: 'Success' },
  { description: 'shows error toast', props: { title: 'Error', variant: 'destructive' }, expectedMock: mockToastError, expectedTitle: 'Error' },
  { description: 'shows success with description', props: { title: 'Success', description: 'Done', variant: 'default' }, expectedMock: mockToastSuccess, expectedTitle: 'Success', expectedOptions: { description: 'Done' } },
  { description: 'shows error with description', props: { title: 'Error', description: 'Failed', variant: 'destructive' }, expectedMock: mockToastError, expectedTitle: 'Error', expectedOptions: { description: 'Failed' } },
];

const durationCases = [
  { description: 'applies custom duration', props: { title: 'Timed', duration: 5000 }, expectedMock: mockToastBase, expectedTitle: 'Timed', expectedOptions: { duration: 5000 } },
  { description: 'applies duration with description', props: { title: 'Timed', description: 'Details', duration: 3000 }, expectedMock: mockToastBase, expectedTitle: 'Timed', expectedOptions: { description: 'Details', duration: 3000 } },
];

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook API', () => {
    it('returns toast and dismiss functions', () => {
      const { result } = setupToastHook();

      expect(result.current).toHaveProperty('toast');
      expect(result.current).toHaveProperty('dismiss');
      expect(typeof result.current.toast).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
    });
  });

  describe('Basic Toast Functionality', () => {
    basicToastCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        const { result } = setupToastHook();
        actWithToast(result, props);
        expectToastCall(expectedMock, expectedTitle, expectedOptions);
      });
    });

    it('handles undefined title', () => {
      const { result } = setupToastHook();
      actWithToast(result, { title: undefined as any });
      expectToastCall(mockToastBase, undefined);
    });
  });

  describe('Toast Variants', () => {
    variantCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        const { result } = setupToastHook();
        actWithToast(result, props);
        expectToastCall(expectedMock, expectedTitle, expectedOptions);
      });
    });

    it('defaults to base toast when variant is undefined', () => {
      const { result } = setupToastHook();
      actWithToast(result, { title: 'Default' });
      expectToastCall(mockToastBase, 'Default');
    });
  });

  describe('Toast Duration', () => {
    durationCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        const { result } = setupToastHook();
        actWithToast(result, props);
        expectToastCall(expectedMock, expectedTitle, expectedOptions);
      });
    });

    it('applies duration with variant', () => {
      const { result } = setupToastHook();
      actWithToast(result, { title: 'Error', variant: 'destructive', duration: 10000 });
      expectToastCall(mockToastError, 'Error', { duration: 10000 });
    });
  });

  describe('Toast Actions', () => {
    it('applies action configuration', () => {
      const actionFn = jest.fn();
      const { result } = setupToastHook();

      actWithToast(result, {
        title: 'Action message',
        action: { label: 'Undo', onClick: actionFn }
      });

      expectToastCall(mockToastBase, 'Action message', {
        action: { label: 'Undo', onClick: actionFn }
      });
    });

    it('applies action with other properties', () => {
      const actionFn = jest.fn();
      const { result } = setupToastHook();

      actWithToast(result, {
        title: 'Complex',
        description: 'With action',
        variant: 'default',
        duration: 5000,
        action: { label: 'Retry', onClick: actionFn }
      });

      expectToastCall(mockToastSuccess, 'Complex', {
        description: 'With action',
        duration: 5000,
        action: { label: 'Retry', onClick: actionFn }
      });
    });
  });

  describe('Toast Dismissal', () => {
    it('dismisses specific toast by id', () => {
      const { result } = setupToastHook();

      act(() => {
        result.current.dismiss('toast-123');
      });

      expect(mockToastDismiss).toHaveBeenCalledWith('toast-123');
    });

    it('dismisses all toasts when no id provided', () => {
      const { result } = setupToastHook();

      act(() => {
        result.current.dismiss();
      });

      expect(mockToastDismiss).toHaveBeenCalledWith();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing toast properties gracefully', () => {
      const { result } = setupToastHook();
      actWithToast(result, {} as any);
      expectToastCall(mockToastBase, undefined);
    });

    it('handles null values in toast properties', () => {
      const { result } = setupToastHook();
      actWithToast(result, {
        title: 'Test',
        description: null as any,
        variant: null as any,
        duration: null as any
      });
      expectToastCall(mockToastBase, 'Test');
    });

    it('handles multiple rapid toast calls', () => {
      const { result } = setupToastHook();

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
      const { result } = setupToastHook();

      actWithToast(result, {
        title: 'Success',
        description: 'All good',
        variant: 'default'
      });

      expectToastCall(mockToastSuccess, 'Success', { description: 'All good' });
      expect(mockToastBase).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('properly maps to Sonner API for error variant', () => {
      const { result } = setupToastHook();

      actWithToast(result, {
        title: 'Error',
        description: 'Something failed',
        variant: 'destructive'
      });

      expectToastCall(mockToastError, 'Error', { description: 'Something failed' });
      expect(mockToastBase).not.toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });

    it('uses base toast function for unknown variants', () => {
      const { result } = setupToastHook();

      actWithToast(result, {
        title: 'Unknown variant',
        variant: 'unknown' as any
      });

      expectToastCall(mockToastBase, 'Unknown variant');
      expect(mockToastSuccess).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  describe('Backwards Compatibility', () => {
    it('maintains API compatibility with old implementation', () => {
      const { result } = setupToastHook();

      actWithToast(result, {
        title: 'Test message',
        description: 'Test description',
        variant: 'destructive'
      });

      expectToastCall(mockToastError, 'Test message', {
        description: 'Test description'
      });
    });

    it('preserves existing interface structure', () => {
      const { result } = setupToastHook();

      expect(result.current).toMatchObject({
        toast: expect.any(Function),
        dismiss: expect.any(Function)
      });
    });
  });
});