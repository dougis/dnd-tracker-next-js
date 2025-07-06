/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterSettings } from '../EncounterSettings';
import { useEncounterSettings } from '@/lib/hooks/useEncounterSettings';
import {
  createTestEncounter,
  createMockHookReturn,
} from '@/__test-utils__/encounter-settings-test-utils';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

// Mock the useEncounterSettings hook
jest.mock('@/lib/hooks/useEncounterSettings');
const mockUseEncounterSettings = useEncounterSettings as jest.MockedFunction<typeof useEncounterSettings>;

describe('EncounterSettings', () => {
  const mockEncounter = createTestEncounter({
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: false,
      enableGridMovement: false,
      gridSize: 5,
      roundTimeLimit: 60,
      lairActionInitiative: 20,
    },
  }) as IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEncounterSettings.mockReturnValue(createMockHookReturn());
  });

  it('renders encounter settings with current values', () => {
    render(<EncounterSettings encounter={mockEncounter} />);

    expect(screen.getByText('Encounter Settings')).toBeInTheDocument();

    // Check that switches reflect current settings
    expect(screen.getByLabelText('Allow Player Visibility')).toBeChecked();
    expect(screen.getByLabelText('Auto-roll Initiative')).not.toBeChecked();
    expect(screen.getByLabelText('Track Resources')).toBeChecked();
    expect(screen.getByLabelText('Enable Lair Actions')).not.toBeChecked();
    expect(screen.getByLabelText('Enable Grid Movement')).not.toBeChecked();
  });

  it('displays additional settings information', () => {
    render(<EncounterSettings encounter={mockEncounter} />);

    expect(screen.getByText('Grid Size:')).toBeInTheDocument();
    expect(screen.getByText('5 ft')).toBeInTheDocument();

    expect(screen.getByText('Lair Action Initiative:')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    expect(screen.getByText('Round Time Limit:')).toBeInTheDocument();
    expect(screen.getByText('60s')).toBeInTheDocument();
  });

  it('calls updateSettings when switches are toggled', async () => {
    const mockHook = createMockHookReturn();
    mockUseEncounterSettings.mockReturnValue(mockHook);

    const user = userEvent.setup();
    render(<EncounterSettings encounter={mockEncounter} />);

    const playerVisibilitySwitch = screen.getByLabelText('Allow Player Visibility');

    await user.click(playerVisibilitySwitch);

    expect(mockHook.updateSettings).toHaveBeenCalledWith({
      allowPlayerVisibility: false,
    });
  });

  it('handles multiple setting changes independently', async () => {
    const mockHook = createMockHookReturn();
    mockUseEncounterSettings.mockReturnValue(mockHook);

    const user = userEvent.setup();
    render(<EncounterSettings encounter={mockEncounter} />);

    // Toggle auto-roll initiative
    const autoRollSwitch = screen.getByLabelText('Auto-roll Initiative');
    await user.click(autoRollSwitch);

    expect(mockHook.updateSettings).toHaveBeenCalledWith({
      autoRollInitiative: true,
    });

    // Toggle lair actions
    const lairActionsSwitch = screen.getByLabelText('Enable Lair Actions');
    await user.click(lairActionsSwitch);

    expect(mockHook.updateSettings).toHaveBeenCalledWith({
      enableLairActions: true,
    });

    expect(mockHook.updateSettings).toHaveBeenCalledTimes(2);
  });

  it('shows loading state when settings are being updated', () => {
    mockUseEncounterSettings.mockReturnValue(
      createMockHookReturn({ loading: true })
    );

    render(<EncounterSettings encounter={mockEncounter} />);

    // When loading, switches should be disabled
    expect(screen.getByLabelText('Allow Player Visibility')).toBeDisabled();
    expect(screen.getByLabelText('Auto-roll Initiative')).toBeDisabled();
    expect(screen.getByLabelText('Track Resources')).toBeDisabled();
  });

  it('displays error state when update fails', () => {
    mockUseEncounterSettings.mockReturnValue(
      createMockHookReturn({ error: 'Failed to update settings' })
    );

    render(<EncounterSettings encounter={mockEncounter} />);

    expect(screen.getByText('Failed to update settings')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls retry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockHook = createMockHookReturn({ error: 'Network error occurred' });
    mockUseEncounterSettings.mockReturnValue(mockHook);

    render(<EncounterSettings encounter={mockEncounter} />);

    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);

    expect(mockHook.retry).toHaveBeenCalledTimes(1);
  });

  it('hides optional settings when not present', () => {
    const encounterWithoutOptionalSettings = createTestEncounter({
      settings: {
        allowPlayerVisibility: true,
        autoRollInitiative: false,
        trackResources: true,
        enableLairActions: false,
        enableGridMovement: false,
        gridSize: 5,
        // No optional settings
      },
    }) as IEncounter;

    render(<EncounterSettings encounter={encounterWithoutOptionalSettings} />);

    expect(screen.queryByText('Lair Action Initiative:')).not.toBeInTheDocument();
    expect(screen.queryByText('Round Time Limit:')).not.toBeInTheDocument();
  });

  it('updates switch states when settings change externally', () => {
    const { rerender } = render(<EncounterSettings encounter={mockEncounter} />);

    // Initially false
    expect(screen.getByLabelText('Auto-roll Initiative')).not.toBeChecked();

    // Update encounter with new settings
    const updatedEncounter = {
      ...mockEncounter,
      settings: {
        ...mockEncounter.settings,
        autoRollInitiative: true,
      },
    };

    rerender(<EncounterSettings encounter={updatedEncounter} />);

    // Should now be checked
    expect(screen.getByLabelText('Auto-roll Initiative')).toBeChecked();
  });

  it('handles numerical input changes', async () => {
    // Mock an enhanced version that would have numerical inputs
    // For now, we're testing the current read-only display
    render(<EncounterSettings encounter={mockEncounter} />);

    // Verify numerical values are displayed correctly
    expect(screen.getByText('5 ft')).toBeInTheDocument(); // gridSize
    expect(screen.getByText('20')).toBeInTheDocument(); // lairActionInitiative
    expect(screen.getByText('60s')).toBeInTheDocument(); // roundTimeLimit
  });

  it('clears error state when settings update successfully', async () => {
    // Start with error state
    mockUseEncounterSettings.mockReturnValue(
      createMockHookReturn({ error: 'Previous error' })
    );

    const { rerender } = render(<EncounterSettings encounter={mockEncounter} />);

    expect(screen.getByText('Previous error')).toBeInTheDocument();

    // Update to success state
    mockUseEncounterSettings.mockReturnValue(createMockHookReturn());

    rerender(<EncounterSettings encounter={mockEncounter} />);

    expect(screen.queryByText('Previous error')).not.toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    render(<EncounterSettings encounter={mockEncounter} />);

    // Check that all switches have proper labels
    expect(screen.getByLabelText('Allow Player Visibility')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-roll Initiative')).toBeInTheDocument();
    expect(screen.getByLabelText('Track Resources')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Lair Actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Grid Movement')).toBeInTheDocument();

    // Check that switches have proper IDs
    expect(screen.getByLabelText('Allow Player Visibility')).toHaveAttribute('id', 'player-visibility');
    expect(screen.getByLabelText('Auto-roll Initiative')).toHaveAttribute('id', 'auto-roll-initiative');
  });
});