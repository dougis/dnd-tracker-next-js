import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EncounterActionButtons } from '../EncounterActionButtons';
import { createMockEncounter } from './test-utils/mockFactories';
import { createConsoleSpy, commonBeforeEach, commonAfterAll } from './test-utils/mockSetup';
import { createMockServices, createMockActionHandlers } from './test-utils/testSetup';
import { clickButton, openDropdown, expectFunctionToBeCalled } from './test-utils/interactionHelpers';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Setup shared mocks
const { EncounterService, toast } = createMockServices();
const { navigation: mockNavigationHandlers, service: mockServiceHandlers } = createMockActionHandlers();

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService', () => ({
  EncounterService,
}));

// Mock the action handlers
jest.mock('../actions/actionHandlers', () => ({
  createNavigationHandlers: jest.fn(() => mockNavigationHandlers),
  createServiceHandlers: jest.fn(() => mockServiceHandlers),
  canStartCombat: jest.fn(),
}));

// Mock console.log
const consoleSpy = createConsoleSpy();

describe('EncounterActionButtons', () => {
  const defaultProps = {
    encounter: createMockEncounter(),
    onRefetch: jest.fn(),
  };

  beforeEach(commonBeforeEach);

  afterAll(() => commonAfterAll(consoleSpy));

  describe('Rendering', () => {
    it('should render dropdown trigger button', () => {
      render(<EncounterActionButtons {...defaultProps} />);

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toBeInTheDocument();
    });

    it('should show dropdown menu when triggered', async () => {
      render(<EncounterActionButtons {...defaultProps} />);
      await openDropdown(/open menu/i);

      const menuItems = ['View Details', 'Edit Encounter', 'Duplicate', 'Share', 'Delete'];
      menuItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should show Start Combat option when combat is enabled', async () => {
      const { canStartCombat } = require('../actions/actionHandlers');
      canStartCombat.mockReturnValue(true);

      render(<EncounterActionButtons {...defaultProps} />);
      await openDropdown(/open menu/i);

      expect(screen.getByText('Start Combat')).toBeInTheDocument();
    });

    it('should not show Start Combat option when combat is disabled', async () => {
      const { canStartCombat } = require('../actions/actionHandlers');
      canStartCombat.mockReturnValue(false);

      render(<EncounterActionButtons {...defaultProps} />);
      await openDropdown(/open menu/i);

      expect(screen.queryByText('Start Combat')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    const testNavigationAction = async (buttonText: string, handler: jest.Mock) => {
      render(<EncounterActionButtons {...defaultProps} />);
      await openDropdown(/open menu/i);
      await clickButton(buttonText);
      expectFunctionToBeCalled(handler);
    };

    it('should handle view action', async () => {
      await testNavigationAction('View Details', mockNavigationHandlers.handleView);
    });

    it('should handle edit action', async () => {
      await testNavigationAction('Edit Encounter', mockNavigationHandlers.handleEdit);
    });

    it('should handle start combat action', async () => {
      const { canStartCombat } = require('../actions/actionHandlers');
      canStartCombat.mockReturnValue(true);

      await testNavigationAction('Start Combat', mockNavigationHandlers.handleStartCombat);
    });

    it('should handle share action', async () => {
      await testNavigationAction('Share', mockNavigationHandlers.handleShare);
    });
  });

  describe('Service Actions', () => {
    const testServiceAction = async (buttonText: string, handler: jest.Mock) => {
      render(<EncounterActionButtons {...defaultProps} />);
      await openDropdown(/open menu/i);
      await clickButton(buttonText);
      expectFunctionToBeCalled(handler);
    };

    it('should handle duplicate action', async () => {
      await testServiceAction('Duplicate', mockServiceHandlers.handleDuplicate);
    });
  });

  describe('Delete Dialog', () => {
    const openDeleteDialog = async () => {
      render(<EncounterActionButtons {...defaultProps} />);
      await openDropdown(/open menu/i);
      await clickButton('Delete');
    };

    it('should open delete dialog when delete is clicked', async () => {
      await openDeleteDialog();

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Encounter')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/Test Encounter/)).toBeInTheDocument();
    });

    it('should close dialog when cancel is clicked', async () => {
      await openDeleteDialog();

      // Cancel the dialog
      await clickButton(/cancel/i);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should call handleDelete when confirmed', async () => {
      mockServiceHandlers.handleDelete.mockResolvedValue(true);

      await openDeleteDialog();

      // Confirm the dialog
      await clickButton('Delete');

      expectFunctionToBeCalled(mockServiceHandlers.handleDelete);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should handle delete operation state management', async () => {
      await openDeleteDialog();

      // Confirm the dialog
      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).not.toBeDisabled();
    });

    it('should handle failed delete scenario', async () => {
      mockServiceHandlers.handleDelete.mockResolvedValue(false);

      await openDeleteDialog();

      // Confirm the dialog
      await clickButton('Delete');

      await waitFor(() => {
        expectFunctionToBeCalled(mockServiceHandlers.handleDelete);
      });
    });
  });

  describe('Event Propagation', () => {
    it('should stop propagation on dropdown trigger click', async () => {
      const parentClickHandler = jest.fn();

      render(
        <div onClick={parentClickHandler}>
          <EncounterActionButtons {...defaultProps} />
        </div>
      );

      await clickButton(/open menu/i);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Different Encounter States', () => {
    it('should render correctly for different encounter statuses', () => {
      const encounterWithActiveStatus = createMockEncounter({ status: 'active' });

      render(<EncounterActionButtons encounter={encounterWithActiveStatus} />);

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle encounter with combat state', () => {
      const encounterWithCombat = createMockEncounter({
        combatState: {
          isActive: true,
          currentTurn: 1,
          currentRound: 1,
          startedAt: new Date(),
          endedAt: null,
          history: [],
        }
      });

      render(<EncounterActionButtons encounter={encounterWithCombat} />);

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toBeInTheDocument();
    });
  });
});