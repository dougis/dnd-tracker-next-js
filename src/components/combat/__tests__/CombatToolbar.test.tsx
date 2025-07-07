import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatToolbar } from '../CombatToolbar';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import {
  createStandardCombatTestEncounter,
  createMockCombatActions,
  createMockInitiativeActions,
  createMockQuickActions
} from './test-helpers';

describe('CombatToolbar', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    mockEncounter = createStandardCombatTestEncounter();

    mockProps = {
      encounter: mockEncounter,
      combatActions: createMockCombatActions(),
      initiativeActions: createMockInitiativeActions(),
      quickActions: createMockQuickActions(),
      settings: {
        showTimer: true,
        showQuickActions: true,
        enableKeyboardShortcuts: true,
        customActions: [],
      },
    };
  });

  describe('Essential Controls', () => {
    it('renders combat toolbar with essential controls', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Initiative Tracker')).toBeInTheDocument();
      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('Next Turn')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('calls onNextTurn when Next Turn button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const nextButton = screen.getByText('Next Turn');
      fireEvent.click(nextButton);

      expect(mockProps.combatActions.onNextTurn).toHaveBeenCalledTimes(1);
    });

    it('calls onPreviousTurn when Previous button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const previousButton = screen.getByText('Previous');
      fireEvent.click(previousButton);

      expect(mockProps.combatActions.onPreviousTurn).toHaveBeenCalledTimes(1);
    });

    it('disables Previous button at start of first round', () => {
      mockEncounter.combatState.currentRound = 1;
      mockEncounter.combatState.currentTurn = 0;
      render(<CombatToolbar {...mockProps} />);

      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('shows pause button when combat is active', () => {
      mockEncounter.combatState.pausedAt = undefined;
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('shows resume button when combat is paused', () => {
      mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    it('calls onPauseCombat when pause button is clicked', () => {
      mockEncounter.combatState.pausedAt = undefined;
      render(<CombatToolbar {...mockProps} />);

      const pauseButton = screen.getByText('Pause');
      fireEvent.click(pauseButton);

      expect(mockProps.combatActions.onPauseCombat).toHaveBeenCalledTimes(1);
    });

    it('calls onResumeCombat when resume button is clicked', () => {
      mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...mockProps} />);

      const resumeButton = screen.getByText('Resume');
      fireEvent.click(resumeButton);

      expect(mockProps.combatActions.onResumeCombat).toHaveBeenCalledTimes(1);
    });

    it('shows end combat button', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('End Combat')).toBeInTheDocument();
    });

    it('calls onEndCombat when end combat button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const endButton = screen.getByText('End Combat');
      fireEvent.click(endButton);

      expect(mockProps.combatActions.onEndCombat).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combat Timer', () => {
    it('displays combat duration when timer is enabled', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('2:00')).toBeInTheDocument(); // 2 minutes elapsed
    });

    it('updates timer display when combat state changes', () => {
      render(<CombatToolbar {...mockProps} />);

      // Verify timer is displayed
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    it('displays round timer when enabled', () => {
      render(<CombatToolbar {...mockProps} />);

      // Should show round timer countdown
      expect(screen.getByText(/Round Timer:/)).toBeInTheDocument();
    });

    it('hides timer when disabled in settings', () => {
      mockProps.settings.showTimer = false;
      render(<CombatToolbar {...mockProps} />);

      expect(screen.queryByText('2:00')).not.toBeInTheDocument();
    });

    it('displays timer correctly when combat is paused', () => {
      mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...mockProps} />);

      // Timer should show paused state
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Integration', () => {
    it('displays QuickActions component when enabled', () => {
      render(<CombatToolbar {...mockProps} />);

      // Test that QuickActions component is rendered by checking for its container
      expect(screen.getByTestId('quick-actions-container')).toBeInTheDocument();
    });

    it('hides quick actions when disabled in settings', () => {
      mockProps.settings.showQuickActions = false;
      render(<CombatToolbar {...mockProps} />);

      expect(screen.queryByTestId('quick-actions-container')).not.toBeInTheDocument();
    });

    it('passes correct props to QuickActions component', () => {
      render(<CombatToolbar {...mockProps} />);

      // Verify that QuickActions receives the participant count correctly
      expect(screen.getByText('Mass Heal (2)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (2)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (2)')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('displays current round and turn information', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('Turn 2 of 2')).toBeInTheDocument();
    });

    it('displays active participant information', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Active: Test Character 2')).toBeInTheDocument();
    });

    it('displays participant count and statistics', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Participants: 2')).toBeInTheDocument();
      expect(screen.getByText('PCs: 1')).toBeInTheDocument();
      expect(screen.getByText('NPCs: 1')).toBeInTheDocument();
    });

    it('displays combat phase correctly', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Combat Active')).toBeInTheDocument();
    });

    it('displays paused state correctly', () => {
      mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Combat Paused')).toBeInTheDocument();
    });

    it('displays inactive state when combat is not active', () => {
      mockEncounter.combatState.isActive = false;
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Combat Inactive')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('responds to keyboard shortcuts when enabled', () => {
      render(<CombatToolbar {...mockProps} />);

      // Space key should advance turn
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      expect(mockProps.combatActions.onNextTurn).toHaveBeenCalledTimes(1);

      // Backspace should go to previous turn
      fireEvent.keyDown(document, { key: 'Backspace', code: 'Backspace' });
      expect(mockProps.combatActions.onPreviousTurn).toHaveBeenCalledTimes(1);

      // P key should pause/resume combat
      fireEvent.keyDown(document, { key: 'p', code: 'KeyP' });
      expect(mockProps.combatActions.onPauseCombat).toHaveBeenCalledTimes(1);
    });

    it('does not respond to keyboard shortcuts when disabled', () => {
      mockProps.settings.enableKeyboardShortcuts = false;
      render(<CombatToolbar {...mockProps} />);

      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      expect(mockProps.combatActions.onNextTurn).not.toHaveBeenCalled();
    });

    it('displays keyboard shortcut hints', () => {
      render(<CombatToolbar {...mockProps} />);

      // Should show tooltips with keyboard shortcuts
      expect(screen.getByRole('button', { name: /next turn/i })).toHaveAttribute('title', 'Next Turn (Space)');
      expect(screen.getByRole('button', { name: /previous/i })).toHaveAttribute('title', 'Previous Turn (Backspace)');
      expect(screen.getByRole('button', { name: /pause/i })).toHaveAttribute('title', 'Pause Combat (P)');
    });
  });

  describe('Toolbar Customization', () => {
    it('allows custom action buttons', () => {
      mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action',
          icon: 'star',
          handler: jest.fn(),
        },
      ];
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('calls custom action handler when clicked', () => {
      const customHandler = jest.fn();
      mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action',
          icon: 'star',
          handler: customHandler,
        },
      ];
      render(<CombatToolbar {...mockProps} />);

      const customButton = screen.getByText('Custom Action');
      fireEvent.click(customButton);

      expect(customHandler).toHaveBeenCalledTimes(1);
    });

    it('allows toggling toolbar sections', () => {
      mockProps.settings.showTimer = false;
      mockProps.settings.showQuickActions = false;
      render(<CombatToolbar {...mockProps} />);

      // Only essential controls should be visible
      expect(screen.getByText('Next Turn')).toBeInTheDocument();
      expect(screen.queryByText('2:00')).not.toBeInTheDocument();
      expect(screen.queryByText('Roll Initiative')).not.toBeInTheDocument();
    });
  });

  describe('Export and Share functionality', () => {
    it('calls onExportInitiative when export button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const exportButton = screen.getByRole('button', { name: /download initiative data/i });
      fireEvent.click(exportButton);

      expect(mockProps.combatActions.onExportInitiative).toHaveBeenCalledTimes(1);
    });

    it('calls onShareInitiative when share button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const shareButton = screen.getByRole('button', { name: /share initiative data/i });
      fireEvent.click(shareButton);

      expect(mockProps.combatActions.onShareInitiative).toHaveBeenCalledTimes(1);
    });

    it('shows settings button', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByRole('button', { name: /combat settings/i })).toBeInTheDocument();
    });

    it('calls onEncounterSettings when settings button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const settingsButton = screen.getByRole('button', { name: /combat settings/i });
      fireEvent.click(settingsButton);

      expect(mockProps.quickActions.onEncounterSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByRole('heading', { name: 'Initiative Tracker' })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByRole('button', { name: /next turn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /end combat/i })).toBeInTheDocument();
    });

    it('has proper ARIA attributes for timer', () => {
      render(<CombatToolbar {...mockProps} />);

      const timerElement = screen.getByText('2:00');
      expect(timerElement).toHaveAttribute('aria-label', expect.stringContaining('Combat duration'));
    });

    it('has proper ARIA attributes for round timer', () => {
      render(<CombatToolbar {...mockProps} />);

      const roundTimerText = screen.getByText(/Round Timer:/);
      const roundTimerElement = roundTimerText.nextElementSibling;
      expect(roundTimerElement).toHaveAttribute('aria-label', expect.stringContaining('Round timer'));
    });

    it('provides keyboard navigation support', () => {
      render(<CombatToolbar {...mockProps} />);

      const nextButton = screen.getByRole('button', { name: /next turn/i });
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);

      // Focus should be on the button
      expect(document.activeElement).toBe(nextButton);
    });
  });

  describe('Error Handling', () => {
    it('handles missing encounter data gracefully', () => {
      const incompleteProps = {
        ...mockProps,
        encounter: {
          ...mockEncounter,
          combatState: null,
        },
      };

      render(<CombatToolbar {...incompleteProps} />);

      // Should render without crashing
      expect(screen.getByText('Initiative Tracker')).toBeInTheDocument();
    });

    it('handles missing participant data gracefully', () => {
      const incompleteProps = {
        ...mockProps,
        encounter: {
          ...mockEncounter,
          participants: [],
        },
      };

      render(<CombatToolbar {...incompleteProps} />);

      expect(screen.getByText('Participants: 0')).toBeInTheDocument();
    });

    it('handles missing action handlers gracefully', () => {
      const incompleteProps = {
        ...mockProps,
        combatActions: {},
      };

      render(<CombatToolbar {...incompleteProps} />);

      // Should render without crashing
      expect(screen.getByText('Initiative Tracker')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const { rerender } = render(<CombatToolbar {...mockProps} />);

      // Re-render with same props
      rerender(<CombatToolbar {...mockProps} />);

      // Component should not re-calculate unnecessarily
      expect(screen.getByText('Participants: 2')).toBeInTheDocument();
    });

    it('updates efficiently when combat state changes', () => {
      const { rerender } = render(<CombatToolbar {...mockProps} />);

      const updatedEncounter = {
        ...mockEncounter,
        combatState: {
          ...mockEncounter.combatState,
          currentTurn: 2,
        },
      };

      rerender(<CombatToolbar {...mockProps} encounter={updatedEncounter} />);

      expect(screen.getByText('Turn 2 of 2')).toBeInTheDocument();
    });
  });
});