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

// Consolidated test runner for standard test patterns
const runStandardToastTest = (props: any, expectedMock: jest.Mock, expectedTitle: string, expectedOptions?: any) => {
  const { result } = setupToastHook();
  actWithToast(result, props);
  expectToastCall(expectedMock, expectedTitle, expectedOptions);
};

// Utility to check that other toast methods weren't called
const expectOtherToastMethodsNotCalled = (calledMock: jest.Mock) => {
  const allMocks = [mockToastBase, mockToastSuccess, mockToastError];
  allMocks.filter(mock => mock !== calledMock).forEach(mock => {
    expect(mock).not.toHaveBeenCalled();
  });
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
        runStandardToastTest(props, expectedMock, expectedTitle, expectedOptions);
      });
    });

    it('handles undefined title', () => {
      runStandardToastTest({ title: undefined as any }, mockToastBase, undefined);
    });
  });

  describe('Toast Variants', () => {
    variantCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        runStandardToastTest(props, expectedMock, expectedTitle, expectedOptions);
      });
    });

    it('defaults to base toast when variant is undefined', () => {
      runStandardToastTest({ title: 'Default' }, mockToastBase, 'Default');
    });
  });

  describe('Toast Duration', () => {
    durationCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        runStandardToastTest(props, expectedMock, expectedTitle, expectedOptions);
      });
    });

    it('applies duration with variant', () => {
      runStandardToastTest({ title: 'Error', variant: 'destructive', duration: 10000 }, mockToastError, 'Error', { duration: 10000 });
    });
  });

  describe('Toast Actions', () => {
    const actionTestCases = [
      {
        description: 'applies action configuration',
        props: (actionFn: jest.Mock) => ({ title: 'Action message', action: { label: 'Undo', onClick: actionFn } }),
        expectedMock: mockToastBase,
        expectedTitle: 'Action message',
        expectedOptions: (actionFn: jest.Mock) => ({ action: { label: 'Undo', onClick: actionFn } })
      },
      {
        description: 'applies action with other properties',
        props: (actionFn: jest.Mock) => ({ title: 'Complex', description: 'With action', variant: 'default', duration: 5000, action: { label: 'Retry', onClick: actionFn } }),
        expectedMock: mockToastSuccess,
        expectedTitle: 'Complex',
        expectedOptions: (actionFn: jest.Mock) => ({ description: 'With action', duration: 5000, action: { label: 'Retry', onClick: actionFn } })
      }
    ];

    actionTestCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        const actionFn = jest.fn();
        runStandardToastTest(props(actionFn), expectedMock, expectedTitle, expectedOptions(actionFn));
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
    const integrationTestCases = [
      {
        description: 'properly maps to Sonner API for success variant',
        props: { title: 'Success', description: 'All good', variant: 'default' as const },
        expectedMock: mockToastSuccess,
        expectedTitle: 'Success',
        expectedOptions: { description: 'All good' }
      },
      {
        description: 'properly maps to Sonner API for error variant',
        props: { title: 'Error', description: 'Something failed', variant: 'destructive' as const },
        expectedMock: mockToastError,
        expectedTitle: 'Error',
        expectedOptions: { description: 'Something failed' }
      },
      {
        description: 'uses base toast function for unknown variants',
        props: { title: 'Unknown variant', variant: 'unknown' as any },
        expectedMock: mockToastBase,
        expectedTitle: 'Unknown variant',
        expectedOptions: undefined
      }
    ];

    integrationTestCases.forEach(({ description, props, expectedMock, expectedTitle, expectedOptions }) => {
      it(description, () => {
        runStandardToastTest(props, expectedMock, expectedTitle, expectedOptions);
        expectOtherToastMethodsNotCalled(expectedMock);
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