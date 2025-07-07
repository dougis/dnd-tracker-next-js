import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from '../QuickActions';

describe('QuickActions', () => {
  let mockProps: any;

  beforeEach(() => {
    mockProps = {
      actions: {
        onRollInitiative: jest.fn(),
        onMassHeal: jest.fn(),
        onMassDamage: jest.fn(),
        onClearConditions: jest.fn(),
        onAddParticipant: jest.fn(),
        onEncounterSettings: jest.fn(),
      },
      disabled: false,
      participantCount: 4,
      settings: {
        showRollInitiative: true,
        showMassActions: true,
        showParticipantManagement: true,
        showSettings: true,
        customActions: [],
      },
    };
  });

  describe('Basic Rendering', () => {
    it('renders all quick action buttons when enabled', () => {
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Roll Initiative')).toBeInTheDocument();
      expect(screen.getByText('Mass Heal (4)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (4)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (4)')).toBeInTheDocument();
      expect(screen.getByText('Add Participant')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders with proper button styling', () => {
      render(<QuickActions {...mockProps} />);

      const rollButton = screen.getByText('Roll Initiative');
      expect(rollButton).toHaveClass('border', 'border-input');
    });

    it('shows participant count in relevant buttons', () => {
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Mass Heal (4)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (4)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (4)')).toBeInTheDocument();
    });
  });

  describe('Action Handlers', () => {
    it('calls onRollInitiative when Roll Initiative button is clicked', () => {
      render(<QuickActions {...mockProps} />);

      const rollButton = screen.getByText('Roll Initiative');
      fireEvent.click(rollButton);

      expect(mockProps.actions.onRollInitiative).toHaveBeenCalledTimes(1);
    });

    it('calls onMassHeal when Mass Heal button is clicked', () => {
      render(<QuickActions {...mockProps} />);

      const healButton = screen.getByText('Mass Heal (4)');
      fireEvent.click(healButton);

      expect(mockProps.actions.onMassHeal).toHaveBeenCalledTimes(1);
    });

    it('calls onMassDamage when Mass Damage button is clicked', () => {
      render(<QuickActions {...mockProps} />);

      const damageButton = screen.getByText('Mass Damage (4)');
      fireEvent.click(damageButton);

      expect(mockProps.actions.onMassDamage).toHaveBeenCalledTimes(1);
    });

    it('calls onClearConditions when Clear Conditions button is clicked', () => {
      render(<QuickActions {...mockProps} />);

      const clearButton = screen.getByText('Clear Conditions (4)');
      fireEvent.click(clearButton);

      expect(mockProps.actions.onClearConditions).toHaveBeenCalledTimes(1);
    });

    it('calls onAddParticipant when Add Participant button is clicked', () => {
      render(<QuickActions {...mockProps} />);

      const addButton = screen.getByText('Add Participant');
      fireEvent.click(addButton);

      expect(mockProps.actions.onAddParticipant).toHaveBeenCalledTimes(1);
    });

    it('calls onEncounterSettings when Settings button is clicked', () => {
      render(<QuickActions {...mockProps} />);

      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      expect(mockProps.actions.onEncounterSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('disables all buttons when disabled prop is true', () => {
      mockProps.disabled = true;
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Roll Initiative')).toBeDisabled();
      expect(screen.getByText('Mass Heal (4)')).toBeDisabled();
      expect(screen.getByText('Mass Damage (4)')).toBeDisabled();
      expect(screen.getByText('Clear Conditions (4)')).toBeDisabled();
      expect(screen.getByText('Add Participant')).toBeDisabled();
      expect(screen.getByText('Settings')).toBeDisabled();
    });

    it('does not call handlers when buttons are disabled', () => {
      mockProps.disabled = true;
      render(<QuickActions {...mockProps} />);

      const rollButton = screen.getByText('Roll Initiative');
      fireEvent.click(rollButton);

      expect(mockProps.actions.onRollInitiative).not.toHaveBeenCalled();
    });
  });

  describe('Settings Configuration', () => {
    it('hides Roll Initiative when showRollInitiative is false', () => {
      mockProps.settings.showRollInitiative = false;
      render(<QuickActions {...mockProps} />);

      expect(screen.queryByText('Roll Initiative')).not.toBeInTheDocument();
    });

    it('hides mass actions when showMassActions is false', () => {
      mockProps.settings.showMassActions = false;
      render(<QuickActions {...mockProps} />);

      expect(screen.queryByText('Mass Heal (4)')).not.toBeInTheDocument();
      expect(screen.queryByText('Mass Damage (4)')).not.toBeInTheDocument();
      expect(screen.queryByText('Clear Conditions (4)')).not.toBeInTheDocument();
    });

    it('hides participant management when showParticipantManagement is false', () => {
      mockProps.settings.showParticipantManagement = false;
      render(<QuickActions {...mockProps} />);

      expect(screen.queryByText('Add Participant')).not.toBeInTheDocument();
    });

    it('hides settings when showSettings is false', () => {
      mockProps.settings.showSettings = false;
      render(<QuickActions {...mockProps} />);

      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('shows only enabled actions when multiple settings are disabled', () => {
      mockProps.settings = {
        showRollInitiative: true,
        showMassActions: false,
        showParticipantManagement: false,
        showSettings: false,
        customActions: [],
      };
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Roll Initiative')).toBeInTheDocument();
      expect(screen.queryByText('Mass Heal (4)')).not.toBeInTheDocument();
      expect(screen.queryByText('Add Participant')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
  });

  describe('Custom Actions', () => {
    it('renders custom action buttons', () => {
      mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action 1',
          icon: 'star',
          handler: jest.fn(),
        },
        {
          id: 'custom2',
          label: 'Custom Action 2',
          icon: 'heart',
          handler: jest.fn(),
        },
      ];
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Custom Action 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Action 2')).toBeInTheDocument();
    });

    it('calls custom action handlers when clicked', () => {
      const customHandler1 = jest.fn();
      const customHandler2 = jest.fn();

      mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action 1',
          icon: 'star',
          handler: customHandler1,
        },
        {
          id: 'custom2',
          label: 'Custom Action 2',
          icon: 'heart',
          handler: customHandler2,
        },
      ];
      render(<QuickActions {...mockProps} />);

      fireEvent.click(screen.getByText('Custom Action 1'));
      fireEvent.click(screen.getByText('Custom Action 2'));

      expect(customHandler1).toHaveBeenCalledTimes(1);
      expect(customHandler2).toHaveBeenCalledTimes(1);
    });

    it('disables custom actions when disabled prop is true', () => {
      mockProps.disabled = true;
      mockProps.settings.customActions = [
        {
          id: 'custom1',
          label: 'Custom Action 1',
          icon: 'star',
          handler: jest.fn(),
        },
      ];
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Custom Action 1')).toBeDisabled();
    });
  });

  describe('Participant Count Display', () => {
    it('shows correct participant count in mass action buttons', () => {
      mockProps.participantCount = 6;
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Mass Heal (6)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (6)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (6)')).toBeInTheDocument();
    });

    it('shows zero participants correctly', () => {
      mockProps.participantCount = 0;
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Mass Heal (0)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (0)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (0)')).toBeInTheDocument();
    });

    it('handles undefined participant count', () => {
      mockProps.participantCount = undefined;
      render(<QuickActions {...mockProps} />);

      expect(screen.getByText('Mass Heal (0)')).toBeInTheDocument();
      expect(screen.getByText('Mass Damage (0)')).toBeInTheDocument();
      expect(screen.getByText('Clear Conditions (0)')).toBeInTheDocument();
    });
  });

  describe('Tooltips and Accessibility', () => {
    it('has proper button labels for screen readers', () => {
      render(<QuickActions {...mockProps} />);

      expect(screen.getByRole('button', { name: /roll initiative/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mass heal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mass damage/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear conditions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add participant/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('has proper tooltips for quick actions', () => {
      render(<QuickActions {...mockProps} />);

      expect(screen.getByTitle('Roll initiative for all participants')).toBeInTheDocument();
      expect(screen.getByTitle('Apply healing to multiple participants')).toBeInTheDocument();
      expect(screen.getByTitle('Apply damage to multiple participants')).toBeInTheDocument();
      expect(screen.getByTitle('Clear conditions from all participants')).toBeInTheDocument();
      expect(screen.getByTitle('Add new participant to encounter')).toBeInTheDocument();
      expect(screen.getByTitle('Open encounter settings')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<QuickActions {...mockProps} />);

      const rollButton = screen.getByText('Roll Initiative');
      rollButton.focus();
      expect(document.activeElement).toBe(rollButton);

      // Tab should move to next button
      fireEvent.keyDown(rollButton, { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).not.toBe(rollButton);
    });
  });

  describe('Button Icons', () => {
    it('displays appropriate icons for each action', () => {
      render(<QuickActions {...mockProps} />);

      // Check for icon elements (using data-testid or class selectors)
      expect(screen.getByTestId('dice-icon')).toBeInTheDocument();
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('arranges buttons in proper layout', () => {
      render(<QuickActions {...mockProps} />);

      const container = screen.getByTestId('quick-actions-container');
      expect(container).toHaveClass('grid', 'grid-cols-3', 'gap-2');
    });

    it('applies consistent button sizing', () => {
      render(<QuickActions {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('btn-sm');
      });
    });

    it('groups related actions together', () => {
      render(<QuickActions {...mockProps} />);

      const initiativeGroup = screen.getByTestId('initiative-group');
      const massActionsGroup = screen.getByTestId('mass-actions-group');
      const managementGroup = screen.getByTestId('management-group');

      expect(initiativeGroup).toContainElement(screen.getByText('Roll Initiative'));
      expect(massActionsGroup).toContainElement(screen.getByText('Mass Heal (4)'));
      expect(massActionsGroup).toContainElement(screen.getByText('Mass Damage (4)'));
      expect(massActionsGroup).toContainElement(screen.getByText('Clear Conditions (4)'));
      expect(managementGroup).toContainElement(screen.getByText('Add Participant'));
      expect(managementGroup).toContainElement(screen.getByText('Settings'));
    });
  });

  describe('Error Handling', () => {
    it('handles missing action handlers gracefully', () => {
      const incompleteProps = {
        ...mockProps,
        actions: {},
      };

      render(<QuickActions {...incompleteProps} />);

      // Should render without crashing
      expect(screen.getByText('Roll Initiative')).toBeInTheDocument();
    });

    it('handles missing settings gracefully', () => {
      const incompleteProps = {
        ...mockProps,
        settings: {},
      };

      render(<QuickActions {...incompleteProps} />);

      // Should render default actions
      expect(screen.getByText('Roll Initiative')).toBeInTheDocument();
      expect(screen.getByText('Mass Heal (4)')).toBeInTheDocument();
    });

    it('handles null/undefined props gracefully', () => {
      const incompleteProps = {
        actions: mockProps.actions,
        disabled: false,
        participantCount: 4,
        settings: null,
      };

      render(<QuickActions {...incompleteProps} />);

      // Should render without crashing
      expect(screen.getByText('Roll Initiative')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes action handlers to prevent unnecessary re-renders', () => {
      const { rerender } = render(<QuickActions {...mockProps} />);

      // Re-render with same props
      rerender(<QuickActions {...mockProps} />);

      // Actions should not be called during re-render
      expect(mockProps.actions.onRollInitiative).not.toHaveBeenCalled();
    });

    it('updates efficiently when participant count changes', () => {
      const { rerender } = render(<QuickActions {...mockProps} />);

      mockProps.participantCount = 6;
      rerender(<QuickActions {...mockProps} />);

      expect(screen.getByText('Mass Heal (6)')).toBeInTheDocument();
    });
  });
});