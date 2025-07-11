/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { EncounterEditClient } from '../EncounterEditClient';
import { EncounterService } from '@/lib/services/EncounterService';
import {
  createTestEncounter,
  createTestParticipant,
  mockApiResponses,
} from '../../__tests__/test-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/services/EncounterService');

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('EncounterEditClient', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  const mockEncounter = createTestEncounter({
    name: 'Dragon Lair Assault',
    description: 'A dangerous encounter in an ancient dragon\'s lair',
    difficulty: 'deadly',
    estimatedDuration: 90,
    targetLevel: 8,
    participants: [
      createTestParticipant({
        name: 'Gandalf',
        type: 'pc',
        maxHitPoints: 68,
        armorClass: 18,
        isPlayer: true,
      }),
      createTestParticipant({
        name: 'Ancient Red Dragon',
        type: 'monster',
        maxHitPoints: 546,
        armorClass: 22,
        isPlayer: false,
      }),
    ],
    tags: ['dragon', 'lair', 'epic'],
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: true,
      lairActionInitiative: 20,
      enableGridMovement: true,
      gridSize: 10,
      roundTimeLimit: 300,
      experienceThreshold: undefined,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    } as any);
  });

  describe('Loading and Error States', () => {
    it('should display loading state while fetching encounter', () => {
      mockEncounterService.getEncounterById.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<EncounterEditClient encounterId="test-id" />);
      
      expect(screen.getByText('Loading encounter...')).toBeInTheDocument();
    });

    it('should display error state when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );
      
      render(<EncounterEditClient encounterId="invalid-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Encounter not found')).toBeInTheDocument();
      });
    });

    it('should display error state on service failure', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.error('Database connection failed')
      );
      
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading encounter')).toBeInTheDocument();
        expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      });
    });

    it('should provide retry mechanism on error', async () => {
      const user = userEvent.setup();
      
      mockEncounterService.getEncounterById
        .mockResolvedValueOnce(mockApiResponses.error('Network error'))
        .mockResolvedValueOnce(mockApiResponses.success(mockEncounter));
      
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
    });
  });

  describe('Form Pre-population', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should pre-populate basic encounter information', async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
        expect(screen.getByDisplayValue('A dangerous encounter in an ancient dragon\'s lair')).toBeInTheDocument();
        expect(screen.getByDisplayValue('deadly')).toBeInTheDocument();
        expect(screen.getByDisplayValue('90')).toBeInTheDocument();
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      });
    });

    it('should pre-populate encounter tags', async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('dragon')).toBeInTheDocument();
        expect(screen.getByText('lair')).toBeInTheDocument();
        expect(screen.getByText('epic')).toBeInTheDocument();
      });
    });

    it('should pre-populate encounter settings', async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        const autoRollToggle = screen.getByLabelText('Auto-roll Initiative');
        const trackResourcesToggle = screen.getByLabelText('Track Resources');
        const lairActionsToggle = screen.getByLabelText('Enable Lair Actions');
        const gridMovementToggle = screen.getByLabelText('Enable Grid Movement');
        
        expect(autoRollToggle).toHaveAttribute('data-state', 'unchecked');
        expect(trackResourcesToggle).toHaveAttribute('data-state', 'checked');
        expect(lairActionsToggle).toHaveAttribute('data-state', 'checked');
        expect(gridMovementToggle).toHaveAttribute('data-state', 'checked');
      });
    });

    it('should pre-populate participants list', async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Ancient Red Dragon')).toBeInTheDocument();
        expect(screen.getByText('HP: 68/68')).toBeInTheDocument();
        expect(screen.getByText('HP: 546/546')).toBeInTheDocument();
        expect(screen.getByText('AC: 18')).toBeInTheDocument();
        expect(screen.getByText('AC: 22')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should require encounter name', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByDisplayValue('Dragon Lair Assault');
      await user.clear(nameInput);
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should validate estimated duration is positive', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('90')).toBeInTheDocument();
      });
      
      const durationInput = screen.getByDisplayValue('90');
      await user.clear(durationInput);
      await user.type(durationInput, '-30');
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(screen.getByText('Duration must be positive')).toBeInTheDocument();
      });
    });

    it('should validate target level is within valid range', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      });
      
      const levelInput = screen.getByDisplayValue('8');
      await user.clear(levelInput);
      await user.type(levelInput, '25');
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(screen.getByText('Level must be between 1 and 20')).toBeInTheDocument();
      });
    });

    it('should validate lair action initiative when lair actions enabled', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'checked');
      });
      
      const lairInitiativeInput = screen.getByDisplayValue('20');
      await user.clear(lairInitiativeInput);
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(screen.getByText('Lair action initiative is required when lair actions are enabled')).toBeInTheDocument();
      });
    });
  });

  describe('Participant Management', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should allow adding new participants', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Add Participant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Add Participant'));
      
      expect(screen.getByText('Add New Participant')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Participant name')).toBeInTheDocument();
    });

    it('should allow editing existing participants', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);
      
      expect(screen.getByText('Edit Participant')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Gandalf')).toBeInTheDocument();
    });

    it('should allow removing participants', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Ancient Red Dragon')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByText('Remove');
      await user.click(removeButtons[0]);
      
      expect(screen.getByText('Remove Participant')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to remove Gandalf from this encounter?')).toBeInTheDocument();
    });

    it('should validate at least one participant exists', async () => {
      const user = userEvent.setup();
      const emptyEncounter = createTestEncounter({ participants: [] });
      
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(emptyEncounter)
      );
      
      render(<EncounterEditClient encounterId="test-id" />);
      
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(screen.getByText('At least one participant is required')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should allow toggling combat settings', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Auto-roll Initiative')).toBeInTheDocument();
      });
      
      const autoRollToggle = screen.getByLabelText('Auto-roll Initiative');
      expect(autoRollToggle).toHaveAttribute('data-state', 'unchecked');
      
      await user.click(autoRollToggle);
      expect(autoRollToggle).toHaveAttribute('data-state', 'checked');
    });

    it('should show lair action settings when enabled', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'checked');
        expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // Lair initiative
      });
    });

    it('should hide lair action settings when disabled', async () => {
      const user = userEvent.setup();
      const noLairEncounter = createTestEncounter({
        ...mockEncounter,
        settings: { ...mockEncounter.settings, enableLairActions: false },
      });
      
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(noLairEncounter)
      );
      
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'unchecked');
        expect(screen.queryByLabelText('Lair Action Initiative')).not.toBeInTheDocument();
      });
    });

    it('should show grid settings when grid movement enabled', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Enable Grid Movement')).toHaveAttribute('data-state', 'checked');
        expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Grid size
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should submit valid form data', async () => {
      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
      
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByDisplayValue('Dragon Lair Assault');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Dragon Encounter');
      
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(mockEncounterService.updateEncounter).toHaveBeenCalledWith(
          'test-id',
          expect.objectContaining({
            name: 'Updated Dragon Encounter',
          })
        );
      });
    });

    it('should redirect to encounter detail on successful save', async () => {
      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
      
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/encounters/test-id');
      });
    });

    it('should display error message on save failure', async () => {
      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.error('Failed to update encounter')
      );
      
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Save Encounter'));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to update encounter')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      mockEncounterService.updateEncounter.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Save Encounter'));
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Navigation and Actions', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should allow canceling edit and return to detail page', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Cancel'));
      
      expect(mockRouterPush).toHaveBeenCalledWith('/encounters/test-id');
    });

    it('should prompt for confirmation when there are unsaved changes', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
      
      // Make a change
      const nameInput = screen.getByDisplayValue('Dragon Lair Assault');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Name');
      
      await user.click(screen.getByText('Cancel'));
      
      expect(screen.getByText('Discard Changes?')).toBeInTheDocument();
      expect(screen.getByText('You have unsaved changes. Are you sure you want to discard them?')).toBeInTheDocument();
    });

    it('should allow resetting form to original values', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
      
      // Make changes
      const nameInput = screen.getByDisplayValue('Dragon Lair Assault');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Name');
      
      await user.click(screen.getByText('Reset'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should render form sections in proper responsive layout', async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument();
        expect(screen.getByText('Participants')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Form Actions')).toBeInTheDocument();
      });
    });

    it('should display proper spacing and layout for form elements', async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      
      await waitFor(() => {
        const form = screen.getByRole('form');
        expect(form).toHaveClass('space-y-6'); // Proper spacing
      });
    });
  });
});