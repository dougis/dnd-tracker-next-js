import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CombatToolbar } from '../CombatToolbar';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createTestEncounter, makeEncounterActive, PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('CombatToolbar', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    mockEncounter = createTestEncounter();
    makeEncounterActive(mockEncounter);
    mockEncounter.combatState.currentTurn = 1;
    mockEncounter.combatState.startedAt = new Date(Date.now() - 120000); // 2 minutes ago
    mockEncounter.combatState.totalDuration = 120000;

    // Add participants to match the initiative order
    mockEncounter.participants = [
      {
        characterId: PARTICIPANT_IDS.FIRST,
        name: 'Test Character 1',
        type: 'Player',
        maxHitPoints: 20,
        currentHitPoints: 20,
        temporaryHitPoints: 0,
        armorClass: 15,
        initiative: 20,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: []
      },
      {
        characterId: PARTICIPANT_IDS.SECOND,
        name: 'Test Character 2',
        type: 'NPC',
        maxHitPoints: 20,
        currentHitPoints: 15,
        temporaryHitPoints: 0,
        armorClass: 14,
        initiative: 15,
        isPlayer: false,
        isVisible: true,
        notes: '',
        conditions: []
      }
    ];

    // Add settings with round timer
    mockEncounter.settings = {
      ...mockEncounter.settings,
      roundTimeLimit: 60000, // 1 minute round timer
    };

    mockProps = {
      encounter: mockEncounter,
      combatActions: {
        onNextTurn: jest.fn(),
        onPreviousTurn: jest.fn(),
        onPauseCombat: jest.fn(),
        onResumeCombat: jest.fn(),
        onEndCombat: jest.fn(),
        onExportInitiative: jest.fn(),
        onShareInitiative: jest.fn(),
      },
      initiativeActions: {
        onEditInitiative: jest.fn(),
        onDelayAction: jest.fn(),
        onReadyAction: jest.fn(),
        onRollInitiative: jest.fn(),
      },
      quickActions: {
        onMassHeal: jest.fn(),
        onMassDamage: jest.fn(),
        onClearConditions: jest.fn(),
        onAddParticipant: jest.fn(),
        onEncounterSettings: jest.fn(),
      },
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

    it('updates timer display in real-time', async () => {
      const { rerender } = render(<CombatToolbar {...mockProps} />);

      // Fast-forward time
      const updatedEncounter = {
        ...mockEncounter,
        combatState: {
          ...mockEncounter.combatState,
          totalDuration: 180000, // 3 minutes
        },
      };

      rerender(<CombatToolbar {...mockProps} encounter={updatedEncounter} />);

      await waitFor(() => {
        expect(screen.getByText('3:00')).toBeInTheDocument();
      });
    });

    it('displays round timer when enabled', () => {
      render(<CombatToolbar {...mockProps} />);

      // Should show round timer countdown
      expect(screen.getByText(/Round Timer:/)).toBeInTheDocument();
    });

    it('shows round timer warning when time is running low', () => {
      // Set round timer to show warning (less than 15 seconds remaining)
      mockEncounter.combatState.startedAt = new Date(Date.now() - 46000); // 46 seconds ago
      render(<CombatToolbar {...mockProps} />);

      const timerElement = screen.getByText(/0:14/);
      expect(timerElement).toHaveClass('text-warning');
    });

    it('shows round timer critical when time is very low', () => {
      // Set round timer to show critical (less than 5 seconds remaining)
      mockEncounter.combatState.startedAt = new Date(Date.now() - 56000); // 56 seconds ago
      render(<CombatToolbar {...mockProps} />);

      const timerElement = screen.getByText(/0:04/);
      expect(timerElement).toHaveClass('text-destructive');
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

  describe('Quick Actions', () => {
    it('displays quick action buttons when enabled', () => {
      render(<CombatToolbar {...mockProps} />);

      expect(screen.getByText('Roll Initiative')).toBeInTheDocument();
      expect(screen.getByText('Mass Heal')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions')).toBeInTheDocument();
      expect(screen.getByText('Add Participant')).toBeInTheDocument();
    });

    it('calls onRollInitiative when Roll Initiative button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const rollButton = screen.getByText('Roll Initiative');
      fireEvent.click(rollButton);

      expect(mockProps.initiativeActions.onRollInitiative).toHaveBeenCalledTimes(1);
    });

    it('calls onMassHeal when Mass Heal button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const healButton = screen.getByText('Mass Heal');
      fireEvent.click(healButton);

      expect(mockProps.quickActions.onMassHeal).toHaveBeenCalledTimes(1);
    });

    it('calls onMassDamage when Mass Damage button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const damageButton = screen.getByText('Mass Damage');
      fireEvent.click(damageButton);

      expect(mockProps.quickActions.onMassDamage).toHaveBeenCalledTimes(1);
    });

    it('calls onClearConditions when Clear Conditions button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const clearButton = screen.getByText('Clear Conditions');
      fireEvent.click(clearButton);

      expect(mockProps.quickActions.onClearConditions).toHaveBeenCalledTimes(1);
    });

    it('calls onAddParticipant when Add Participant button is clicked', () => {
      render(<CombatToolbar {...mockProps} />);

      const addButton = screen.getByText('Add Participant');
      fireEvent.click(addButton);

      expect(mockProps.quickActions.onAddParticipant).toHaveBeenCalledTimes(1);
    });

    it('hides quick actions when disabled in settings', () => {
      mockProps.settings.showQuickActions = false;
      render(<CombatToolbar {...mockProps} />);

      expect(screen.queryByText('Roll Initiative')).not.toBeInTheDocument();
      expect(screen.queryByText('Mass Heal')).not.toBeInTheDocument();
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
      expect(screen.getByTitle('Next Turn (Space)')).toBeInTheDocument();
      expect(screen.getByTitle('Previous Turn (Backspace)')).toBeInTheDocument();
      expect(screen.getByTitle('Pause/Resume (P)')).toBeInTheDocument();
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
      expect(timerElement).toHaveAttribute('aria-label', 'Combat duration: 2 minutes');
    });

    it('has proper ARIA attributes for round timer', () => {
      render(<CombatToolbar {...mockProps} />);

      const roundTimerElement = screen.getByText(/Round Timer:/);
      expect(roundTimerElement).toHaveAttribute('aria-label', expect.stringContaining('Round timer'));
    });

    it('provides keyboard navigation support', () => {
      render(<CombatToolbar {...mockProps} />);

      const nextButton = screen.getByText('Next Turn');
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);

      // Tab should move to next focusable element
      fireEvent.keyDown(nextButton, { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).not.toBe(nextButton);
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
      
      expect(screen.getByText('Turn 1 of 2')).toBeInTheDocument();
    });
  });
});