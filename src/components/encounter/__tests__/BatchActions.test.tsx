import { screen, waitFor } from '@testing-library/react';
import { clickButton, expectFunctionToBeCalled } from './test-utils/interactionHelpers';
import { COMMON_TEST_ENCOUNTERS, mockSuccessfulResponse, executeActionTest, executeDeleteDialogTest, executeErrorActionTest } from './test-utils/batchActionsSharedMocks';
import {
  createDefaultBatchActionsProps,
  createBatchActionsRenderer,
  setupBatchActionsBeforeEach
} from './test-utils/testSetup';
import { createBatchTestMocks } from './test-utils/batchTestHelpers';

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

describe('BatchActions', () => {
  const defaultProps = createDefaultBatchActionsProps();
  const renderBatchActions = createBatchActionsRenderer(defaultProps);

  // Helper function to test action button behavior
  const testActionButton = async (
    buttonName: string | RegExp,
    expectedToastTitle: string
  ) => {
    await executeActionTest(
      {
        mockFetch,
        buttonName,
        expectedToastTitle
      },
      renderBatchActions,
      clickButton,
      waitFor,
      (title: string, description: string) => {
        expect(mockToast).toHaveBeenCalledWith({ title, description });
      },
      () => {
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      }
    );
  };

  // Helper function to test error handling for actions
  const testActionError = async (
    buttonName: string | RegExp,
    expectedErrorMessage: string,
    isDeleteAction = false
  ) => {
    await executeErrorActionTest(
      {
        mockFetch,
        buttonName,
        errorMessage: expectedErrorMessage,
        isDeleteAction
      },
      renderBatchActions,
      clickButton,
      waitFor,
      (message: string) => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    );
  };

  // Helper function to test encounter count display
  const _testEncounterCountDisplay = (count: number, expectedText: string) => {
    renderBatchActions({ selectedCount: count });
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  };

  // Helper function to test delete dialog workflow
  const testDeleteDialogWorkflow = async (actionType: 'open' | 'cancel' | 'confirm') => {
    await executeDeleteDialogTest(
      actionType,
      mockFetch,
      renderBatchActions,
      clickButton,
      waitFor,
      screen,
      (title: string, description: string) => {
        expect(mockToast).toHaveBeenCalledWith({ title, description });
      },
      () => {
        expectFunctionToBeCalled(defaultProps.onClearSelection);
        expectFunctionToBeCalled(defaultProps.onRefetch);
      }
    );
  };

  beforeEach(() => {
    setupBatchActionsBeforeEach(mockFetch);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

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
      await testActionButton(/duplicate/i, 'Encounters duplicated');
    });

    it('should handle archive action', async () => {
      await testActionButton(/archive/i, 'Encounters archived');
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
      mockSuccessfulResponse(mockFetch);

      renderBatchActions({ selectedEncounters: COMMON_TEST_ENCOUNTERS });
      await clickButton(/delete/i);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();

      await clickButton('Delete');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Encounters deleted',
          description: '3 encounters have been deleted successfully.',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in duplicate action', async () => {
      await testActionError(/duplicate/i, 'API Error');
    });

    it('should handle errors in archive action', async () => {
      await testActionError(/archive/i, 'API Error');
    });

    it('should handle errors in delete action', async () => {
      await testActionError(/delete/i, 'API Error', true);
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