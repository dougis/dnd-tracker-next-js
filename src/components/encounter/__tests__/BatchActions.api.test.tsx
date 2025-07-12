import { screen, waitFor } from '@testing-library/react';
import { clickButton } from './test-utils/interactionHelpers';
import {
  createDefaultBatchActionsProps,
  createBatchActionsRenderer,
  setupBatchActionsBeforeEach
} from './test-utils/testSetup';
import {
  createBatchTestMocks,
  mockSuccessApi,
  mockPartialFailureApi,
  mockErrorApi,
  mockNetworkError,
  expectPartialResult,
  expectEmptyError,
  runSuccessTest,
  runErrorTest,
} from './test-utils/batchTestHelpers';

// Create mocks using consolidated utilities
const { mockToast, mockFetch } = createBatchTestMocks();

// Mock configurations - keeping inline to avoid initialization issues
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('../BatchActions/utils', () => ({
  getEncounterText: jest.fn((count: number) =>
    `${count} encounter${count !== 1 ? 's' : ''}`
  ),
}));

describe('BatchActions API Integration', () => {
  const defaultProps = createDefaultBatchActionsProps();
  const renderBatchActions = createBatchActionsRenderer(defaultProps);

  beforeEach(() => {
    setupBatchActionsBeforeEach(mockFetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Bulk Duplicate', () => {
    it('should call batch API with duplicate operation', async () => {
      await runSuccessTest(
        'duplicate',
        () => mockSuccessApi({ operation: 'duplicate' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        defaultProps.onClearSelection,
        defaultProps.onRefetch
      );
    });

    it('should handle duplicate API errors', async () => {
      await runErrorTest(
        'duplicate',
        'Server error',
        () => mockErrorApi({ statusCode: 500, errorMessage: 'Server error' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast
      );
    });

    it('should handle partial failures in duplicate operation', async () => {
      mockPartialFailureApi({ operation: 'duplicate' });
      renderBatchActions();
      await clickButton(/duplicate/i);
      await waitFor(() => {
        expectPartialResult(
          mockToast,
          'duplicate',
          2,
          1,
          defaultProps.onClearSelection,
          defaultProps.onRefetch
        );
      });
    });
  });

  describe('Bulk Archive', () => {
    it('should call batch API with archive operation', async () => {
      await runSuccessTest(
        'archive',
        () => mockSuccessApi({ operation: 'archive' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        defaultProps.onClearSelection,
        defaultProps.onRefetch
      );
    });

    it('should handle archive API errors', async () => {
      await runErrorTest(
        'archive',
        'Access denied',
        () => mockErrorApi({ statusCode: 403, errorMessage: 'Access denied' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast
      );
    });
  });

  describe('Bulk Delete', () => {
    it('should call batch API with delete operation after confirmation', async () => {
      await runSuccessTest(
        'delete',
        () => mockSuccessApi({ operation: 'delete' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        defaultProps.onClearSelection,
        defaultProps.onRefetch,
        true
      );
    });

    it('should handle delete API errors', async () => {
      await runErrorTest(
        'delete',
        'Database error',
        () => mockErrorApi({ statusCode: 500, errorMessage: 'Database error' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        true
      );
    });

    it('should handle network errors', async () => {
      await runErrorTest(
        'delete',
        'Network error',
        () => mockNetworkError('Network error'),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        true
      );
    });

    it('should close delete dialog after successful operation', async () => {
      mockSuccessApi({ operation: 'delete' });
      renderBatchActions();
      await clickButton(/delete/i);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      await clickButton('Delete');
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedEncounters array', async () => {
      renderBatchActions({ selectedEncounters: [], selectedCount: 0 });
      await clickButton(/duplicate/i);
      await waitFor(() => {
        expectEmptyError(mockToast, 'duplicate');
      });
    });

    it('should handle missing selectedEncounters prop', async () => {
      renderBatchActions({
        selectedCount: 0,
        onClearSelection: jest.fn(),
        onRefetch: jest.fn(),
        selectedEncounters: undefined
      });
      await clickButton(/duplicate/i);
      await waitFor(() => {
        expectEmptyError(mockToast, 'duplicate');
      });
    });
  });
});