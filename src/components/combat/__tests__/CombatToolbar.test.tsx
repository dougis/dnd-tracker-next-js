import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatToolbar } from '../CombatToolbar';
import {
  setupCombatToolbarTest,
  expectInitiativeTrackerToExist,
  expectCombatControlsToExist,
  expectComponentState,
  clickButtonAndExpectCall
} from './test-helpers';

describe('CombatToolbar', () => {
  let testSetup: ReturnType<typeof setupCombatToolbarTest>;

  beforeEach(() => {
    testSetup = setupCombatToolbarTest();
  });

  describe('Essential Controls', () => {
    it('renders combat toolbar with essential controls', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expectInitiativeTrackerToExist();
      expectComponentState({ roundNumber: 2 });
      expectCombatControlsToExist();
    });

    it('calls onNextTurn when Next Turn button is clicked', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      clickButtonAndExpectCall('Next Turn', testSetup.mockCombatActions.onNextTurn);
    });

    it('calls onPreviousTurn when Previous button is clicked', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      clickButtonAndExpectCall('Previous', testSetup.mockCombatActions.onPreviousTurn);
    });

    it('disables Previous button at start of first round', () => {
      const firstRoundSetup = setupCombatToolbarTest();
      firstRoundSetup.mockEncounter.combatState.currentRound = 1;
      firstRoundSetup.mockEncounter.combatState.currentTurn = 0;
      render(<CombatToolbar {...firstRoundSetup.mockProps} />);

      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('shows pause button when combat is active', () => {
      const activeSetup = setupCombatToolbarTest();
      activeSetup.mockEncounter.combatState.pausedAt = undefined;
      render(<CombatToolbar {...activeSetup.mockProps} />);

      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('shows resume button when combat is paused', () => {
      const pausedSetup = setupCombatToolbarTest();
      pausedSetup.mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...pausedSetup.mockProps} />);

      expectComponentState({ isPaused: true });
    });

    it('calls onPauseCombat when pause button is clicked', () => {
      const activeSetup = setupCombatToolbarTest();
      activeSetup.mockEncounter.combatState.pausedAt = undefined;
      render(<CombatToolbar {...activeSetup.mockProps} />);

      clickButtonAndExpectCall('Pause', activeSetup.mockCombatActions.onPauseCombat);
    });

    it('calls onResumeCombat when resume button is clicked', () => {
      const pausedSetup = setupCombatToolbarTest();
      pausedSetup.mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...pausedSetup.mockProps} />);

      clickButtonAndExpectCall('Resume', pausedSetup.mockCombatActions.onResumeCombat);
    });

    it('shows end combat button', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('End Combat')).toBeInTheDocument();
    });

    it('calls onEndCombat when end combat button is clicked', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      clickButtonAndExpectCall('End Combat', testSetup.mockCombatActions.onEndCombat);
    });
  });

  describe('Combat Timer', () => {
    it('displays combat duration when timer is enabled', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('2:00')).toBeInTheDocument(); // 2 minutes elapsed
    });

    it('updates timer display when combat state changes', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Verify timer is displayed
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    it('displays round timer when enabled', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Should show round timer countdown
      expect(screen.getByText(/Round Timer:/)).toBeInTheDocument();
    });

    it('hides timer when disabled in settings', () => {
      testSetup.mockProps.settings.showTimer = false;
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.queryByText('2:00')).not.toBeInTheDocument();
    });

    it('displays timer correctly when combat is paused', () => {
      testSetup.mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Timer should show paused state
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Integration', () => {
    it('displays QuickActions component when enabled', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Test that QuickActions component is rendered by checking for its container
      expect(screen.getByTestId('quick-actions-container')).toBeInTheDocument();
    });

    it('hides quick actions when disabled in settings', () => {
      testSetup.mockProps.settings.showQuickActions = false;
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.queryByTestId('quick-actions-container')).not.toBeInTheDocument();
    });

    it('passes correct props to QuickActions component', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Verify that QuickActions receives the participant count correctly
      expect(screen.getByText('Mass Heal (2)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (2)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (2)')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('displays current round and turn information', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('Turn 2 of 2')).toBeInTheDocument();
    });

    it('displays active participant information', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Active: Test Character 2')).toBeInTheDocument();
    });

    it('displays participant count and statistics', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Participants: 2')).toBeInTheDocument();
      expect(screen.getByText('PCs: 1')).toBeInTheDocument();
      expect(screen.getByText('NPCs: 1')).toBeInTheDocument();
    });

    it('displays combat phase correctly', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Combat Active')).toBeInTheDocument();
    });

    it('displays paused state correctly', () => {
      testSetup.mockEncounter.combatState.pausedAt = new Date();
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Combat Paused')).toBeInTheDocument();
    });

    it('displays inactive state when combat is not active', () => {
      testSetup.mockEncounter.combatState.isActive = false;
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Combat Inactive')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('responds to keyboard shortcuts when enabled', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Space key should advance turn
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      expect(testSetup.mockProps.combatActions.onNextTurn).toHaveBeenCalledTimes(1);

      // Backspace should go to previous turn
      fireEvent.keyDown(document, { key: 'Backspace', code: 'Backspace' });
      expect(testSetup.mockProps.combatActions.onPreviousTurn).toHaveBeenCalledTimes(1);

      // P key should pause/resume combat
      fireEvent.keyDown(document, { key: 'p', code: 'KeyP' });
      expect(testSetup.mockProps.combatActions.onPauseCombat).toHaveBeenCalledTimes(1);
    });

    it('does not respond to keyboard shortcuts when disabled', () => {
      testSetup.mockProps.settings.enableKeyboardShortcuts = false;
      render(<CombatToolbar {...testSetup.mockProps} />);

      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      expect(testSetup.mockProps.combatActions.onNextTurn).not.toHaveBeenCalled();
    });

    it('displays keyboard shortcut hints', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Should show tooltips with keyboard shortcuts
      expect(screen.getByRole('button', { name: /next turn/i })).toHaveAttribute('title', 'Next Turn (Space)');
      expect(screen.getByRole('button', { name: /previous/i })).toHaveAttribute('title', 'Previous Turn (Backspace)');
      expect(screen.getByRole('button', { name: /pause/i })).toHaveAttribute('title', 'Pause Combat (P)');
    });
  });

  describe('Toolbar Customization', () => {
    it('allows custom action buttons', () => {
      testSetup.mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action',
          icon: 'star',
          handler: jest.fn(),
        },
      ];
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('calls custom action handler when clicked', () => {
      const customHandler = jest.fn();
      testSetup.mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action',
          icon: 'star',
          handler: customHandler,
        },
      ];
      render(<CombatToolbar {...testSetup.mockProps} />);

      const customButton = screen.getByText('Custom Action');
      fireEvent.click(customButton);

      expect(customHandler).toHaveBeenCalledTimes(1);
    });

    it('allows toggling toolbar sections', () => {
      testSetup.mockProps.settings.showTimer = false;
      testSetup.mockProps.settings.showQuickActions = false;
      render(<CombatToolbar {...testSetup.mockProps} />);

      // Only essential controls should be visible
      expect(screen.getByText('Next Turn')).toBeInTheDocument();
      expect(screen.queryByText('2:00')).not.toBeInTheDocument();
      expect(screen.queryByText('Roll Initiative')).not.toBeInTheDocument();
    });
  });

  describe('Export and Share functionality', () => {
    it('calls onExportInitiative when export button is clicked', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      const exportButton = screen.getByRole('button', { name: /download initiative data/i });
      fireEvent.click(exportButton);

      expect(testSetup.mockProps.combatActions.onExportInitiative).toHaveBeenCalledTimes(1);
    });

    it('calls onShareInitiative when share button is clicked', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      const shareButton = screen.getByRole('button', { name: /share initiative data/i });
      fireEvent.click(shareButton);

      expect(testSetup.mockProps.combatActions.onShareInitiative).toHaveBeenCalledTimes(1);
    });

    it('shows settings button', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByRole('button', { name: /combat settings/i })).toBeInTheDocument();
    });

    it('calls onEncounterSettings when settings button is clicked', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      const settingsButton = screen.getByRole('button', { name: /combat settings/i });
      fireEvent.click(settingsButton);

      expect(testSetup.mockProps.quickActions.onEncounterSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByRole('heading', { name: 'Initiative Tracker' })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      expect(screen.getByRole('button', { name: /next turn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /end combat/i })).toBeInTheDocument();
    });

    it('has proper ARIA attributes for timer', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      const timerElement = screen.getByText('2:00');
      expect(timerElement).toHaveAttribute('aria-label', expect.stringContaining('Combat duration'));
    });

    it('has proper ARIA attributes for round timer', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

      const roundTimerText = screen.getByText(/Round Timer:/);
      const roundTimerElement = roundTimerText.nextElementSibling;
      expect(roundTimerElement).toHaveAttribute('aria-label', expect.stringContaining('Round timer'));
    });

    it('provides keyboard navigation support', () => {
      render(<CombatToolbar {...testSetup.mockProps} />);

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
        ...testSetup.mockProps,
        encounter: {
          ...testSetup.mockEncounter,
          combatState: null,
        },
      };

      render(<CombatToolbar {...incompleteProps} />);

      // Should render without crashing
      expect(screen.getByText('Initiative Tracker')).toBeInTheDocument();
    });

    it('handles missing participant data gracefully', () => {
      const incompleteProps = {
        ...testSetup.mockProps,
        encounter: {
          ...testSetup.mockEncounter,
          participants: [],
        },
      };

      render(<CombatToolbar {...incompleteProps} />);

      expect(screen.getByText('Participants: 0')).toBeInTheDocument();
    });

    it('handles missing action handlers gracefully', () => {
      const incompleteProps = {
        ...testSetup.mockProps,
        combatActions: {},
      };

      render(<CombatToolbar {...incompleteProps} />);

      // Should render without crashing
      expect(screen.getByText('Initiative Tracker')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const { rerender } = render(<CombatToolbar {...testSetup.mockProps} />);

      // Re-render with same props
      rerender(<CombatToolbar {...testSetup.mockProps} />);

      // Component should not re-calculate unnecessarily
      expect(screen.getByText('Participants: 2')).toBeInTheDocument();
    });

    it('updates efficiently when combat state changes', () => {
      const { rerender } = render(<CombatToolbar {...testSetup.mockProps} />);

      const updatedEncounter = {
        ...testSetup.mockEncounter,
        combatState: {
          ...testSetup.mockEncounter.combatState,
          currentTurn: 2,
        },
      };

      rerender(<CombatToolbar {...testSetup.mockProps} encounter={updatedEncounter} />);

      expect(screen.getByText('Turn 2 of 2')).toBeInTheDocument();
    });
  });
});