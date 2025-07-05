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

  // Helper function to test action button behavior
  const testActionButton = async (
    buttonName: string | RegExp,
    expectedConsoleMessage: string,
    expectedClearCalls = 1,
    expectedRefetchCalls = 1
  ) => {
    renderBatchActions();
    await clickButton(buttonName);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expectedConsoleMessage);
      expectFunctionToBeCalled(defaultProps.onClearSelection, expectedClearCalls);
      expectFunctionToBeCalled(defaultProps.onRefetch, expectedRefetchCalls);
    });
  };

  // Helper function to test error handling for actions
  const testActionError = async (
    buttonName: string | RegExp,
    expectedErrorMessage: string,
    isDeleteAction = false
  ) => {
    renderBatchActions();

    if (isDeleteAction) {
      await clickButton(/delete/i);
      await clickButton('Delete');
    } else {
      await clickButton(buttonName);
    }

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: expectedErrorMessage,
        variant: 'destructive',
      });
    });
  };

  // Helper function to test encounter count display
  const testEncounterCountDisplay = (count: number, expectedText: string) => {
    renderBatchActions({ selectedCount: count });
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  };

  // Helper function to test delete dialog workflow
  const testDeleteDialogWorkflow = async (actionType: 'open' | 'cancel' | 'confirm') => {
    renderBatchActions();

    // Open dialog
    await clickButton(/delete/i);

    if (actionType === 'open') {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Encounters')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete 3 encounters?/)).toBeInTheDocument();
    } else if (actionType === 'cancel') {
      await clickButton(/cancel/i);
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    } else if (actionType === 'confirm') {
      await clickButton('Delete');

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Bulk delete encounters');
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      });
    }
  };

  beforeEach(commonBeforeEach);

  afterAll(() => commonAfterAll(consoleSpy));

  describe('Rendering', () => {
    it('should render with selected count', () => {
      testEncounterCountDisplay(3, '3 encounters selected');
    });

    it('should render singular text for one encounter', () => {
      testEncounterCountDisplay(1, '1 encounter selected');
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
      await testActionButton(/duplicate/i, 'Bulk duplicate encounters');
    });

    it('should handle archive action', async () => {
      await testActionButton(/archive/i, 'Bulk archive encounters');
    });
  });

  describe('Delete Dialog', () => {
    it('should open delete dialog when delete button is clicked', async () => {
      await testDeleteDialogWorkflow('open');
    });

    it('should close dialog when cancel is clicked', async () => {
      await testDeleteDialogWorkflow('cancel');
    });

    it('should handle delete confirmation', async () => {
      await testDeleteDialogWorkflow('confirm');
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
      await testActionError(/duplicate/i, 'Failed to duplicate encounter. Please try again.');
    });

    it('should handle errors in archive action', async () => {
      await testActionError(/archive/i, 'Failed to archive encounter. Please try again.');
    });

    it('should handle errors in delete action', async () => {
      await testActionError(/delete/i, 'Failed to delete encounter. Please try again.', true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero selected count', () => {
      testEncounterCountDisplay(0, '0 encounters selected');
    });

    it('should handle large selected count', () => {
      testEncounterCountDisplay(100, '100 encounters selected');
    });
  });
});