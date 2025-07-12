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

  // Test helper functions to eliminate duplication
  const setupUserEvent = () => userEvent.setup();

  const getButtonByName = (name: string | RegExp) =>
    screen.getByRole('button', { name });

  const clickButtonAndWait = async (user: any, buttonName: string | RegExp) => {
    const button = getButtonByName(buttonName);
    await user.click(button);
  };

  const expectToastCall = (expectedCall: any) => {
    expect(mockToast).toHaveBeenCalledWith(expectedCall);
  };

  const expectSuccessToast = (title: string, description: string) => {
    expectToastCall({ title, description });
  };

  const expectErrorToast = (description: string) => {
    expectToastCall({
      title: 'Error',
      description,
      variant: 'destructive',
    });
  };

  const createConsoleSpy = () => {
    return jest.spyOn(console, 'log').mockImplementation(() => {
      throw new Error('Test error');
    });
  };

  const openDeleteDialog = async (user: any) => {
    await clickButtonAndWait(user, /delete/i);
  };

  const confirmDeleteAction = async (user: any) => {
    const confirmButton = getButtonByName('Delete');
    await user.click(confirmButton);
  };

  const cancelDeleteAction = async (user: any) => {
    const cancelButton = getButtonByName(/cancel/i);
    await user.click(cancelButton);
  };

  const expectDialogVisible = () => {
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Parties')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete 3 parties/)).toBeInTheDocument();
  };

  const expectDialogHidden = () => {
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  };

  const expectCallbacksCalled = () => {
    expect(defaultProps.onClearSelection).toHaveBeenCalled();
    expect(defaultProps.onRefetch).toHaveBeenCalled();
  };

  const testBulkActionSuccess = async (buttonName: string | RegExp, expectedTitle: string, expectedDescription: string) => {
    const user = setupUserEvent();
    renderBatchActions();

    await clickButtonAndWait(user, buttonName);

    await waitFor(() => {
      expectSuccessToast(expectedTitle, expectedDescription);
    });
  };

  const testBulkActionError = async (buttonName: string | RegExp, expectedErrorMessage: string) => {
    const user = setupUserEvent();
    const consoleSpy = createConsoleSpy();

    renderBatchActions();

    await clickButtonAndWait(user, buttonName);

    await waitFor(() => {
      expectErrorToast(expectedErrorMessage);
    });

    consoleSpy.mockRestore();
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

      expect(getButtonByName(/view/i)).toBeInTheDocument();
      expect(getButtonByName(/edit/i)).toBeInTheDocument();
      expect(getButtonByName(/delete/i)).toBeInTheDocument();
    });

    it('should render clear selection button', () => {
      renderBatchActions();
      expect(getButtonByName(/clear/i)).toBeInTheDocument();
    });
  });

  describe('Bulk Delete Functionality', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = setupUserEvent();
      renderBatchActions();

      await openDeleteDialog(user);

      await waitFor(() => {
        expectDialogVisible();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = setupUserEvent();
      renderBatchActions();

      await openDeleteDialog(user);
      await cancelDeleteAction(user);

      await waitFor(() => {
        expectDialogHidden();
      });
    });

    it('should handle delete confirmation and call callbacks', async () => {
      const user = setupUserEvent();
      renderBatchActions();

      await openDeleteDialog(user);
      await confirmDeleteAction(user);

      await waitFor(() => {
        expectCallbacksCalled();
        expectSuccessToast('Parties deleted', '3 parties have been deleted successfully.');
      });
    });

    it('should handle delete errors gracefully', async () => {
      const user = setupUserEvent();

      // Mock an error by causing onRefetch to throw
      const errorProps = {
        ...defaultProps,
        onRefetch: jest.fn().mockImplementation(() => {
          throw new Error('Delete failed');
        }),
      };

      renderBatchActions(errorProps);

      await openDeleteDialog(user);
      await confirmDeleteAction(user);

      await waitFor(() => {
        expectErrorToast('Failed to delete parties. Please try again.');
      });
    });
  });

  describe('Bulk Edit Functionality', () => {
    it('should handle bulk edit action', async () => {
      await testBulkActionSuccess(/edit/i, 'Bulk edit started', 'Editing 3 parties...');
    });

    it('should handle bulk edit errors gracefully', async () => {
      await testBulkActionError(/edit/i, 'Failed to edit parties. Please try again.');
    });
  });

  describe('Bulk View Functionality', () => {
    it('should handle bulk view action', async () => {
      await testBulkActionSuccess(/view/i, 'Opening party view', 'Viewing 3 parties...');
    });

    it('should handle bulk view errors gracefully', async () => {
      await testBulkActionError(/view/i, 'Failed to view parties. Please try again.');
    });
  });

  describe('Clear Selection', () => {
    it('should call onClearSelection when clear button is clicked', async () => {
      const user = setupUserEvent();
      renderBatchActions();

      await clickButtonAndWait(user, /clear/i);

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

      expect(getButtonByName(/view/i)).toBeDisabled();
      expect(getButtonByName(/edit/i)).toBeDisabled();
      expect(getButtonByName(/delete/i)).toBeDisabled();
    });
  });
});