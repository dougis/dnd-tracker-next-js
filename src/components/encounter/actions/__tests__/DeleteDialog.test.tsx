import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteDialog } from '../DeleteDialog';
import type { EncounterListItem } from '../../types';
import { Types } from 'mongoose';

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

describe('DeleteDialog', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: jest.fn(),
    encounter: createMockEncounter(),
    onConfirm: jest.fn(),
    isDeleting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<DeleteDialog {...defaultProps} />);
      
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Encounter')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/Test Encounter/)).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<DeleteDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<DeleteDialog {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('should display encounter name in description', () => {
      const customEncounter = createMockEncounter({ name: 'Custom Encounter Name' });
      
      render(<DeleteDialog {...defaultProps} encounter={customEncounter} />);
      
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/Custom Encounter Name/)).toBeInTheDocument();
    });

    it('should handle encounter names with special characters', () => {
      const customEncounter = createMockEncounter({ name: 'Encounter "with" <special> & characters' });
      
      render(<DeleteDialog {...defaultProps} encounter={customEncounter} />);
      
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when deleting', () => {
      render(<DeleteDialog {...defaultProps} isDeleting={true} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Deleting...' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeDisabled();
    });

    it('should show normal state when not deleting', () => {
      render(<DeleteDialog {...defaultProps} isDeleting={false} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteDialog {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);
      
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not call onConfirm when button is disabled', () => {
      render(<DeleteDialog {...defaultProps} isDeleting={true} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Deleting...' });
      
      // Try to click the disabled button
      deleteButton.click();
      
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    it('should handle escape key to close dialog', async () => {
      const user = userEvent.setup();
      render(<DeleteDialog {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DeleteDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should focus on dialog when opened', () => {
      render(<DeleteDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveFocus();
    });

    it('should have proper button roles', () => {
      render(<DeleteDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      
      expect(cancelButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty encounter name gracefully', () => {
      const encounterWithEmptyName = createMockEncounter({ name: '' });
      
      render(<DeleteDialog {...defaultProps} encounter={encounterWithEmptyName} />);
      
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });

    it('should handle very long encounter names', () => {
      const longName = 'A'.repeat(200);
      const encounterWithLongName = createMockEncounter({ name: longName });
      
      render(<DeleteDialog {...defaultProps} encounter={encounterWithLongName} />);
      
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should handle rapid state changes', async () => {
      const { rerender } = render(<DeleteDialog {...defaultProps} isDeleting={false} />);
      
      // Switch to deleting state
      rerender(<DeleteDialog {...defaultProps} isDeleting={true} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Deleting...' });
      expect(deleteButton).toBeDisabled();
      
      // Switch back to normal state
      rerender(<DeleteDialog {...defaultProps} isDeleting={false} />);
      
      const normalButton = screen.getByRole('button', { name: 'Delete' });
      expect(normalButton).not.toBeDisabled();
    });

    it('should handle multiple rapid clicks on delete button', async () => {
      const user = userEvent.setup();
      render(<DeleteDialog {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      
      // Rapid clicks
      await user.click(deleteButton);
      await user.click(deleteButton);
      await user.click(deleteButton);
      
      // Should still only call onConfirm once per click
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(3);
    });
  });

  describe('Dialog State Management', () => {
    it('should handle controlled open state', () => {
      const { rerender } = render(<DeleteDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      
      rerender(<DeleteDialog {...defaultProps} isOpen={true} />);
      
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should call onOpenChange with correct parameters', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      
      render(<DeleteDialog {...defaultProps} onOpenChange={onOpenChange} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});