import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BatchActions } from '../BatchActions';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('BatchActions', () => {
  const defaultProps = {
    selectedCount: 3,
    onClearSelection: jest.fn(),
    onRefetch: jest.fn(),
  };

  const renderBatchActions = (props = {}) => {
    return render(<BatchActions {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with selected count', () => {
      renderBatchActions();
      expect(screen.getByText('3 parties selected')).toBeInTheDocument();
    });

    it('should render singular text for one party', () => {
      renderBatchActions({ selectedCount: 1 });
      expect(screen.getByText('1 party selected')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      renderBatchActions();

      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render clear selection button', () => {
      renderBatchActions();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('Bulk Delete Functionality', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderBatchActions();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Parties')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete 3 parties/)).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderBatchActions();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Cancel dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should handle delete confirmation and call callbacks', async () => {
      const user = userEvent.setup();
      renderBatchActions();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(defaultProps.onClearSelection).toHaveBeenCalled();
        expect(defaultProps.onRefetch).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Parties deleted',
          description: '3 parties have been deleted successfully.',
        });
      });
    });

    it('should handle delete errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock an error by causing onRefetch to throw
      const errorProps = {
        ...defaultProps,
        onRefetch: jest.fn().mockImplementation(() => {
          throw new Error('Delete failed');
        }),
      };

      renderBatchActions(errorProps);

      // Open dialog and confirm
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to delete parties. Please try again.',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Bulk Edit Functionality', () => {
    it('should handle bulk edit action', async () => {
      const user = userEvent.setup();
      renderBatchActions();

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Bulk edit started',
          description: 'Editing 3 parties...',
        });
      });
    });

    it('should handle bulk edit errors gracefully', async () => {
      const user = userEvent.setup();

      // Create a spy that throws an error
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Edit failed');
      });

      renderBatchActions();

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to edit parties. Please try again.',
          variant: 'destructive',
        });
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Bulk View Functionality', () => {
    it('should handle bulk view action', async () => {
      const user = userEvent.setup();
      renderBatchActions();

      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Opening party view',
          description: 'Viewing 3 parties...',
        });
      });
    });

    it('should handle bulk view errors gracefully', async () => {
      const user = userEvent.setup();

      // Create a spy that throws an error
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('View failed');
      });

      renderBatchActions();

      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to view parties. Please try again.',
          variant: 'destructive',
        });
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Clear Selection', () => {
    it('should call onClearSelection when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderBatchActions();

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(defaultProps.onClearSelection).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero selected count', () => {
      renderBatchActions({ selectedCount: 0 });
      expect(screen.getByText('0 parties selected')).toBeInTheDocument();
    });

    it('should handle large selected count', () => {
      renderBatchActions({ selectedCount: 100 });
      expect(screen.getByText('100 parties selected')).toBeInTheDocument();
    });

    it('should disable action buttons when no parties are selected', () => {
      renderBatchActions({ selectedCount: 0 });

      expect(screen.getByRole('button', { name: /view/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });
  });
});