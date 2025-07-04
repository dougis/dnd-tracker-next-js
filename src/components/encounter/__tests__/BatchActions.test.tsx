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

// Mock the utils
jest.mock('../BatchActions/utils', () => ({
  getEncounterText: jest.fn((count: number) =>
    `${count} encounter${count !== 1 ? 's' : ''}`
  ),
}));

// Mock the error utils
jest.mock('../actions/errorUtils', () => ({
  createSuccessHandler: jest.fn((toast) => jest.fn((action, target) => {
    toast({
      title: `Encounter ${action}d`,
      description: `"${target}" has been ${action}d successfully.`,
    });
  })),
  createErrorHandler: jest.fn((toast) => jest.fn((action) => {
    toast({
      title: 'Error',
      description: `Failed to ${action} encounter. Please try again.`,
      variant: 'destructive',
    });
  })),
}));

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('BatchActions', () => {
  const defaultProps = {
    selectedCount: 3,
    onClearSelection: jest.fn(),
    onRefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('should render with selected count', () => {
      render(<BatchActions {...defaultProps} />);

      expect(screen.getByText('3 encounters selected')).toBeInTheDocument();
    });

    it('should render singular text for one encounter', () => {
      render(<BatchActions {...defaultProps} selectedCount={1} />);

      expect(screen.getByText('1 encounter selected')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<BatchActions {...defaultProps} />);

      expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onClearSelection when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /clear selection/i }));

      expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
    });

    it('should handle duplicate action', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /duplicate/i }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk duplicate encounters');
        expect(defaultProps.onClearSelection).toHaveBeenCalled();
        expect(defaultProps.onRefetch).toHaveBeenCalled();
      });
    });

    it('should handle archive action', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /archive/i }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk archive encounters');
        expect(defaultProps.onClearSelection).toHaveBeenCalled();
        expect(defaultProps.onRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Dialog', () => {
    it('should open delete dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Encounters')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete 3 encounters?/)).toBeInTheDocument();
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should handle delete confirmation', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      // Open dialog
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Confirm delete
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk delete encounters');
      });

      await waitFor(() => {
        expect(defaultProps.onClearSelection).toHaveBeenCalled();
        expect(defaultProps.onRefetch).toHaveBeenCalled();
      });
    });

    it('should show delete button initially and handle click', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();

      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk delete encounters');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Mock console.log to throw an error
      consoleSpy.mockImplementation(() => {
        throw new Error('Test error');
      });
    });

    afterEach(() => {
      consoleSpy.mockImplementation(() => {});
    });

    it('should handle errors in duplicate action', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /duplicate/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to duplicate encounter. Please try again.',
          variant: 'destructive',
        });
      });
    });

    it('should handle errors in archive action', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /archive/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to archive encounter. Please try again.',
          variant: 'destructive',
        });
      });
    });

    it('should handle errors in delete action', async () => {
      const user = userEvent.setup();
      render(<BatchActions {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to delete encounter. Please try again.',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero selected count', () => {
      render(<BatchActions {...defaultProps} selectedCount={0} />);

      expect(screen.getByText('0 encounters selected')).toBeInTheDocument();
    });

    it('should handle large selected count', () => {
      render(<BatchActions {...defaultProps} selectedCount={100} />);

      expect(screen.getByText('100 encounters selected')).toBeInTheDocument();
    });
  });
});