import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BatchActions } from '../BatchActions';
import { createMockToast, commonBeforeEach } from './test-utils/mockSetup';
import { clickButton } from './test-utils/interactionHelpers';
import {
  mockSuccessfulBatchApi,
  mockPartialFailureBatchApi,
  mockErrorBatchApi,
  mockNetworkErrorBatchApi,
  expectBatchApiCall,
  expectSuccessfulOperationResult,
  expectPartialSuccessResult,
  expectErrorToast,
  expectEmptySelectionError,
} from './test-utils/batchApiHelpers';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the toast hook
const mockToast = createMockToast();
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
  const defaultProps = {
    selectedCount: 3,
    selectedEncounters: ['enc1', 'enc2', 'enc3'],
    onClearSelection: jest.fn(),
    onRefetch: jest.fn(),
  };

  const renderBatchActions = (props = {}) => {
    return render(<BatchActions {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    commonBeforeEach();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Bulk Duplicate', () => {
    it('should call batch API with duplicate operation', async () => {
      mockSuccessfulBatchApi({ operation: 'duplicate' });

      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expectBatchApiCall('duplicate');
      });

      await waitFor(() => {
        expectSuccessfulOperationResult(
          mockToast,
          'duplicate',
          3,
          defaultProps.onClearSelection,
          defaultProps.onRefetch
        );
      });
    });

    it('should handle duplicate API errors', async () => {
      mockErrorBatchApi({ statusCode: 500, errorMessage: 'Server error' });

      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expectErrorToast(mockToast, 'Server error');
      });
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
      mockSuccessfulBatchApi({ operation: 'archive' });

      renderBatchActions();
      await clickButton(/archive/i);

      await waitFor(() => {
        expectBatchApiCall('archive');
      });

      await waitFor(() => {
        expectSuccessfulOperationResult(
          mockToast,
          'archive',
          3,
          defaultProps.onClearSelection,
          defaultProps.onRefetch
        );
      });
    });

    it('should handle archive API errors', async () => {
      mockErrorBatchApi({ statusCode: 403, errorMessage: 'Access denied' });

      renderBatchActions();
      await clickButton(/archive/i);

      await waitFor(() => {
        expectErrorToast(mockToast, 'Access denied');
      });
    });
  });

  describe('Bulk Delete', () => {
    it('should call batch API with delete operation after confirmation', async () => {
      mockSuccessfulBatchApi({ operation: 'delete' });

      renderBatchActions();

      // Open delete dialog
      await clickButton(/delete/i);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Confirm deletion
      await clickButton('Delete');

      await waitFor(() => {
        expectBatchApiCall('delete');
      });

      await waitFor(() => {
        expectSuccessfulOperationResult(
          mockToast,
          'delete',
          3,
          defaultProps.onClearSelection,
          defaultProps.onRefetch
        );
      });
    });

    it('should handle delete API errors', async () => {
      mockErrorBatchApi({ statusCode: 500, errorMessage: 'Database error' });

      renderBatchActions();

      // Open delete dialog and confirm
      await clickButton(/delete/i);
      await clickButton('Delete');

      await waitFor(() => {
        expectErrorToast(mockToast, 'Database error');
      });
    });

    it('should handle network errors', async () => {
      mockNetworkErrorBatchApi('Network error');

      renderBatchActions();

      // Open delete dialog and confirm
      await clickButton(/delete/i);
      await clickButton('Delete');

      await waitFor(() => {
        expectErrorToast(mockToast, 'Network error');
      });
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