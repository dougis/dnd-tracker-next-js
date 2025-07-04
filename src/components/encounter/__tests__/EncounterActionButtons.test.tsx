import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterActionButtons } from '../EncounterActionButtons';
import type { EncounterListItem } from '../types';
import { Types } from 'mongoose';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock the EncounterService
const mockEncounterService = {
  cloneEncounter: jest.fn(),
  deleteEncounter: jest.fn(),
};
jest.mock('@/lib/services/EncounterService', () => ({
  EncounterService: mockEncounterService,
}));

// Mock the action handlers
const mockNavigationHandlers = {
  handleView: jest.fn(),
  handleEdit: jest.fn(),
  handleStartCombat: jest.fn(),
  handleShare: jest.fn(),
};

const mockServiceHandlers = {
  handleDuplicate: jest.fn(),
  handleDelete: jest.fn(),
};

jest.mock('../actions/actionHandlers', () => ({
  createNavigationHandlers: jest.fn(() => mockNavigationHandlers),
  createServiceHandlers: jest.fn(() => mockServiceHandlers),
  canStartCombat: jest.fn(),
}));

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

const createMockEncounter = (overrides: Partial<EncounterListItem> = {}): EncounterListItem => ({
  id: 'test-encounter-id',
  ownerId: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'A test encounter',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  participants: [],
  settings: {
    allowPlayerNotes: true,
    autoRollInitiative: false,
    trackResources: true,
    enableTurnTimer: false,
    turnTimerDuration: 300,
    showInitiativeToPlayers: true,
  },
  combatState: {
    isActive: false,
    currentTurn: 0,
    currentRound: 0,
    startedAt: null,
    endedAt: null,
    history: [],
  },
  status: 'draft',
  partyId: new Types.ObjectId(),
  isPublic: false,
  sharedWith: [],
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  participantCount: 0,
  playerCount: 0,
  ...overrides,
});

describe('EncounterActionButtons', () => {
  const defaultProps = {
    encounter: createMockEncounter(),
    onRefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('should render dropdown trigger button', () => {
      render(<EncounterActionButtons {...defaultProps} />);

      const button = screen.getByRole('button', { name: /open menu/i });
      expect(button).toBeInTheDocument();
    });

    it('should show dropdown menu when triggered', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should show Start Combat option when combat is enabled', async () => {
      const { canStartCombat } = require('../actions/actionHandlers');
      canStartCombat.mockReturnValue(true);

      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      expect(screen.getByText('Start Combat')).toBeInTheDocument();
    });

    it('should not show Start Combat option when combat is disabled', async () => {
      const { canStartCombat } = require('../actions/actionHandlers');
      canStartCombat.mockReturnValue(false);

      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      expect(screen.queryByText('Start Combat')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('should handle view action', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const viewButton = screen.getByText('View Details');
      await user.click(viewButton);

      expect(mockNavigationHandlers.handleView).toHaveBeenCalledTimes(1);
    });

    it('should handle edit action', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const editButton = screen.getByText('Edit Encounter');
      await user.click(editButton);

      expect(mockNavigationHandlers.handleEdit).toHaveBeenCalledTimes(1);
    });

    it('should handle start combat action', async () => {
      const { canStartCombat } = require('../actions/actionHandlers');
      canStartCombat.mockReturnValue(true);

      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const startCombatButton = screen.getByText('Start Combat');
      await user.click(startCombatButton);

      expect(mockNavigationHandlers.handleStartCombat).toHaveBeenCalledTimes(1);
    });

    it('should handle share action', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const shareButton = screen.getByText('Share');
      await user.click(shareButton);

      expect(mockNavigationHandlers.handleShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Actions', () => {
    it('should handle duplicate action', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const duplicateButton = screen.getByText('Duplicate');
      await user.click(duplicateButton);

      expect(mockServiceHandlers.handleDuplicate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete Dialog', () => {
    it('should open delete dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Encounter')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/Test Encounter/)).toBeInTheDocument();
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      // Open dropdown and click delete
      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Cancel the dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should call handleDelete when confirmed', async () => {
      mockServiceHandlers.handleDelete.mockResolvedValue(true);

      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      // Open dropdown and click delete
      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Confirm the dialog
      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      expect(mockServiceHandlers.handleDelete).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should handle delete operation state management', async () => {
      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      // Open dropdown and click delete
      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Confirm the dialog
      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).not.toBeDisabled();
    });

    it('should handle failed delete scenario', async () => {
      mockServiceHandlers.handleDelete.mockResolvedValue(false);

      const user = userEvent.setup();
      render(<EncounterActionButtons {...defaultProps} />);

      // Open dropdown and click delete
      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Confirm the dialog
      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockServiceHandlers.handleDelete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Event Propagation', () => {
    it('should stop propagation on dropdown trigger click', async () => {
      const user = userEvent.setup();
      const parentClickHandler = jest.fn();

      render(
        <div onClick={parentClickHandler}>
          <EncounterActionButtons {...defaultProps} />
        </div>
      );

      const triggerButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(triggerButton);

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