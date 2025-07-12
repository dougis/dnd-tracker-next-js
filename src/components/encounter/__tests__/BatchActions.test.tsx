import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BatchActions } from '../BatchActions';
import { createMockToast, createConsoleSpy, commonBeforeEach, commonAfterAll } from './test-utils/mockSetup';
import { clickButton, expectFunctionToBeCalled } from './test-utils/interactionHelpers';

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

const consoleSpy = createConsoleSpy();

describe('BatchActions', () => {
  const defaultProps = {
    selectedCount: 3,
    onClearSelection: jest.fn(),
    onRefetch: jest.fn(),
  };

  // Helper function to render BatchActions with default props
  const renderBatchActions = (props = {}) => {
    return render(<BatchActions {...defaultProps} {...props} />);
  };

  beforeEach(commonBeforeEach);

  afterAll(() => commonAfterAll(consoleSpy));

  describe('Rendering', () => {
    it('should render with selected count', () => {
      renderBatchActions({ selectedCount: 3 });
      expect(screen.getByText('3 encounters selected')).toBeInTheDocument();
    });

    it('should render singular text for one encounter', () => {
      renderBatchActions({ selectedCount: 1 });
      expect(screen.getByText('1 encounter selected')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      renderBatchActions();

      const buttonNames = [/duplicate/i, /archive/i, /delete/i, /clear selection/i];
      buttonNames.forEach(name => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should call onClearSelection when clear button is clicked', async () => {
      renderBatchActions();
      await clickButton(/clear selection/i);
      expectFunctionToBeCalled(defaultProps.onClearSelection);
    });

    it('should handle duplicate action', async () => {
      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk duplicate encounters');
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });

    it('should handle archive action', async () => {
      renderBatchActions();
      await clickButton(/archive/i);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk archive encounters');
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });
  });

  describe('Delete Dialog', () => {
    it('should open delete dialog when delete button is clicked', async () => {
      renderBatchActions();
      await clickButton(/delete/i);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Encounters')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete 3 encounters?/)).toBeInTheDocument();
    });

    it('should close dialog when cancel is clicked', async () => {
      renderBatchActions();
      await clickButton(/delete/i);
      await clickButton(/cancel/i);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should handle delete confirmation', async () => {
      renderBatchActions();
      await clickButton(/delete/i);
      await clickButton('Delete');

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk delete encounters');
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    });

    it('should show delete button initially and handle click', async () => {
      renderBatchActions();
      await clickButton(/delete/i);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();

      await clickButton('Delete');

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
      renderBatchActions();
      await clickButton(/duplicate/i);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to duplicate encounter. Please try again.',
          variant: 'destructive',
        });
      });
    });

    it('should handle errors in archive action', async () => {
      renderBatchActions();
      await clickButton(/archive/i);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to archive encounter. Please try again.',
          variant: 'destructive',
        });
      });
    });

    it('should handle errors in delete action', async () => {
      renderBatchActions();
      await clickButton(/delete/i);
      await clickButton('Delete');

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
      renderBatchActions({ selectedCount: 0 });
      expect(screen.getByText('0 encounters selected')).toBeInTheDocument();
    });

    it('should handle large selected count', () => {
      renderBatchActions({ selectedCount: 100 });
      expect(screen.getByText('100 encounters selected')).toBeInTheDocument();
    });
  });
});