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

// Consolidated test runner to eliminate code duplication
const runStandardToastTest = (
  toastProps: any,
  expectedMock: jest.Mock,
  expectedTitle: string,
  expectedOptions?: any
) => {
  const { result } = setupToastHook();
  actWithToast(result, toastProps);
  expectToastCall(expectedMock, expectedTitle, expectedOptions);
};

// Utility to check that other toast methods weren't called
const expectOtherToastMethodsNotCalled = (calledMock: jest.Mock) => {
  const allMocks = [mockToastBase, mockToastSuccess, mockToastError];
  allMocks.filter(mock => mock !== calledMock).forEach(mock => {
    expect(mock).not.toHaveBeenCalled();
  });
};

// Consolidated test cases to reduce duplication
const testCases = {
  basic: [
    { desc: 'shows default toast with title only', props: { title: 'Test message' }, mock: mockToastBase, title: 'Test message' },
    { desc: 'shows toast with title and description', props: { title: 'Test message', description: 'Additional details' }, mock: mockToastBase, title: 'Test message', options: { description: 'Additional details' } },
    { desc: 'handles empty title', props: { title: '' }, mock: mockToastBase, title: '' },
  ],
  variants: [
    { desc: 'shows success toast', props: { title: 'Success', variant: 'default' }, mock: mockToastSuccess, title: 'Success' },
    { desc: 'shows error toast', props: { title: 'Error', variant: 'destructive' }, mock: mockToastError, title: 'Error' },
    { desc: 'shows success with description', props: { title: 'Success', description: 'Done', variant: 'default' }, mock: mockToastSuccess, title: 'Success', options: { description: 'Done' } },
    { desc: 'shows error with description', props: { title: 'Error', description: 'Failed', variant: 'destructive' }, mock: mockToastError, title: 'Error', options: { description: 'Failed' } },
  ],
  duration: [
    { desc: 'applies custom duration', props: { title: 'Timed', duration: 5000 }, mock: mockToastBase, title: 'Timed', options: { duration: 5000 } },
    { desc: 'applies duration with description', props: { title: 'Timed', description: 'Details', duration: 3000 }, mock: mockToastBase, title: 'Timed', options: { description: 'Details', duration: 3000 } },
  ]
};

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
    testCases.basic.forEach(({ desc, props, mock, title, options }) => {
      it(desc, () => {
        runStandardToastTest(props, mock, title, options);
      });
    });

    it('handles undefined title', () => {
      runStandardToastTest({ title: undefined as any }, mockToastBase, undefined);
    });
  });

  describe('Toast Variants', () => {
    testCases.variants.forEach(({ desc, props, mock, title, options }) => {
      it(desc, () => {
        runStandardToastTest(props, mock, title, options);
      });
    });

    it('defaults to base toast when variant is undefined', () => {
      runStandardToastTest({ title: 'Default' }, mockToastBase, 'Default');
    });
  });

  describe('Toast Duration', () => {
    testCases.duration.forEach(({ desc, props, mock, title, options }) => {
      it(desc, () => {
        runStandardToastTest(props, mock, title, options);
      });
    });

    it('applies duration with variant', () => {
      runStandardToastTest({ title: 'Error', variant: 'destructive', duration: 10000 }, mockToastError, 'Error', { duration: 10000 });
    });
  });

  describe('Toast Actions', () => {
    it('applies action configuration', () => {
      const actionFn = jest.fn();
      runStandardToastTest(
        { title: 'Action message', action: { label: 'Undo', onClick: actionFn } },
        mockToastBase,
        'Action message',
        { action: { label: 'Undo', onClick: actionFn } }
      );
    });

    it('applies action with other properties', () => {
      const actionFn = jest.fn();
      runStandardToastTest(
        { title: 'Complex', description: 'With action', variant: 'default', duration: 5000, action: { label: 'Retry', onClick: actionFn } },
        mockToastSuccess,
        'Complex',
        { description: 'With action', duration: 5000, action: { label: 'Retry', onClick: actionFn } }
      );
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
      runStandardToastTest({} as any, mockToastBase, undefined);
    });

    it('handles null values in toast properties', () => {
      runStandardToastTest({
        title: 'Test',
        description: null as any,
        variant: null as any,
        duration: null as any
      }, mockToastBase, 'Test');
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
    const integrationTests = [
      { desc: 'properly maps to Sonner API for success variant', props: { title: 'Success', description: 'All good', variant: 'default' as const }, mock: mockToastSuccess, title: 'Success', options: { description: 'All good' } },
      { desc: 'properly maps to Sonner API for error variant', props: { title: 'Error', description: 'Something failed', variant: 'destructive' as const }, mock: mockToastError, title: 'Error', options: { description: 'Something failed' } },
      { desc: 'uses base toast function for unknown variants', props: { title: 'Unknown variant', variant: 'unknown' as any }, mock: mockToastBase, title: 'Unknown variant', options: undefined }
    ];

    integrationTests.forEach(({ desc, props, mock, title, options }) => {
      it(desc, () => {
        runStandardToastTest(props, mock, title, options);
        expectOtherToastMethodsNotCalled(mock);
      });
    });
  });

  describe('Backwards Compatibility', () => {
    it('maintains API compatibility with old implementation', () => {
      runStandardToastTest({
        title: 'Test message',
        description: 'Test description',
        variant: 'destructive'
      }, mockToastError, 'Test message', {
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