import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BatchActions } from '../BatchActions';
import { createMockToast, commonBeforeEach } from './test-utils/mockSetup';
import { clickButton, expectFunctionToBeCalled } from './test-utils/interactionHelpers';

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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          operation: 'duplicate',
          results: [
            { encounterId: 'enc1', status: 'success' },
            { encounterId: 'enc2', status: 'success' },
            { encounterId: 'enc3', status: 'success' },
          ],
          summary: { totalProcessed: 3, successful: 3, failed: 0 },
        }),
      });

      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/encounters/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'duplicate',
            encounterIds: ['enc1', 'enc2', 'enc3'],
            options: {},
          }),
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Encounters duplicated',
          description: '3 encounters have been duplicated successfully.',
        });
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });

    it('should handle duplicate API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Server error',
          variant: 'destructive',
        });
      });
    });

    it('should handle partial failures in duplicate operation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          operation: 'duplicate',
          results: [
            { encounterId: 'enc1', status: 'success' },
            { encounterId: 'enc2', status: 'success' },
          ],
          errors: [
            { encounterId: 'enc3', status: 'error', error: 'Access denied' },
          ],
          summary: { totalProcessed: 3, successful: 2, failed: 1 },
        }),
      });

      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Partial Success',
          description: '2 encounters duplicated successfully, 1 failed.',
        });
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });
  });

  describe('Bulk Archive', () => {
    it('should call batch API with archive operation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          operation: 'archive',
          results: [
            { encounterId: 'enc1', status: 'success' },
            { encounterId: 'enc2', status: 'success' },
            { encounterId: 'enc3', status: 'success' },
          ],
          summary: { totalProcessed: 3, successful: 3, failed: 0 },
        }),
      });

      renderBatchActions();
      await clickButton(/archive/i);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/encounters/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'archive',
            encounterIds: ['enc1', 'enc2', 'enc3'],
            options: {},
          }),
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Encounters archived',
          description: '3 encounters have been archived successfully.',
        });
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });

    it('should handle archive API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      });

      renderBatchActions();
      await clickButton(/archive/i);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Access denied',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Bulk Delete', () => {
    it('should call batch API with delete operation after confirmation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          operation: 'delete',
          results: [
            { encounterId: 'enc1', status: 'success' },
            { encounterId: 'enc2', status: 'success' },
            { encounterId: 'enc3', status: 'success' },
          ],
          summary: { totalProcessed: 3, successful: 3, failed: 0 },
        }),
      });

      renderBatchActions();

      // Open delete dialog
      await clickButton(/delete/i);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Confirm deletion
      await clickButton('Delete');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/encounters/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'delete',
            encounterIds: ['enc1', 'enc2', 'enc3'],
            options: {},
          }),
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Encounters deleted',
          description: '3 encounters have been deleted successfully.',
        });
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });

    it('should handle delete API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Database error' }),
      });

      renderBatchActions();

      // Open delete dialog and confirm
      await clickButton(/delete/i);
      await clickButton('Delete');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Database error',
          variant: 'destructive',
        });
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderBatchActions();

      // Open delete dialog and confirm
      await clickButton(/delete/i);
      await clickButton('Delete');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });

    it('should close delete dialog after successful operation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          operation: 'delete',
          results: [
            { encounterId: 'enc1', status: 'success' },
            { encounterId: 'enc2', status: 'success' },
            { encounterId: 'enc3', status: 'success' },
          ],
          summary: { totalProcessed: 3, successful: 3, failed: 0 },
        }),
      });

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

      // Should not make API call for empty selection
      expect(global.fetch).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'No encounters selected for duplicate.',
          variant: 'destructive',
        });
      });
    });

    it('should handle missing selectedEncounters prop', async () => {
      renderBatchActions({ 
        selectedCount: 0, 
        onClearSelection: jest.fn(), 
        onRefetch: jest.fn() 
      });
      await clickButton(/duplicate/i);

      expect(global.fetch).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'No encounters selected for duplicate.',
          variant: 'destructive',
        });
      });
    });
  });
});