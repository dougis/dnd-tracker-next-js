import { screen, waitFor } from '@testing-library/react';
import { clickButton } from './test-utils/interactionHelpers';
import {
  createDefaultBatchActionsProps,
  createBatchActionsRenderer,
  setupBatchActionsBeforeEach
} from './test-utils/testSetup';
import {
  mockSuccessfulBatchApi,
  mockPartialFailureBatchApi,
  mockErrorBatchApi,
  mockNetworkErrorBatchApi,
  expectPartialSuccessResult,
  expectEmptySelectionError,
  executeBatchOperationTest,
  executeBatchErrorTest,
} from './test-utils/batchApiHelpers';
import { createMockToast } from './test-utils/mockSetup';

// Create mocks
const mockToast = createMockToast();
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock the utils
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
      await executeBatchOperationTest(
        'duplicate',
        () => mockSuccessfulBatchApi({ operation: 'duplicate' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        defaultProps.onClearSelection,
        defaultProps.onRefetch
      );
    });

    it('should handle duplicate API errors', async () => {
      await executeBatchErrorTest(
        'duplicate',
        'Server error',
        () => mockErrorBatchApi({ statusCode: 500, errorMessage: 'Server error' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast
      );
    });

    it('should handle partial failures in duplicate operation', async () => {
      mockPartialFailureBatchApi({ operation: 'duplicate' });

      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expectPartialSuccessResult(
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
      await executeBatchOperationTest(
        'archive',
        () => mockSuccessfulBatchApi({ operation: 'archive' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        defaultProps.onClearSelection,
        defaultProps.onRefetch
      );
    });

    it('should handle archive API errors', async () => {
      await executeBatchErrorTest(
        'archive',
        'Access denied',
        () => mockErrorBatchApi({ statusCode: 403, errorMessage: 'Access denied' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast
      );
    });
  });

  describe('Bulk Delete', () => {
    it('should call batch API with delete operation after confirmation', async () => {
      await executeBatchOperationTest(
        'delete',
        () => mockSuccessfulBatchApi({ operation: 'delete' }),
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
      await executeBatchErrorTest(
        'delete',
        'Database error',
        () => mockErrorBatchApi({ statusCode: 500, errorMessage: 'Database error' }),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        true
      );
    });

    it('should handle network errors', async () => {
      await executeBatchErrorTest(
        'delete',
        'Network error',
        () => mockNetworkErrorBatchApi('Network error'),
        renderBatchActions,
        clickButton,
        waitFor,
        mockToast,
        true
      );
    });

    it('should close delete dialog after successful operation', async () => {
      mockSuccessfulBatchApi({ operation: 'delete' });

      renderBatchActions();

      // Open delete dialog and confirm
      await clickButton(/delete/i);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      await clickButton('Delete');

      // Check that dialog is closed after operation
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
        expectEmptySelectionError(mockToast, 'duplicate');
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
        expectEmptySelectionError(mockToast, 'duplicate');
      });
    });
  });
});