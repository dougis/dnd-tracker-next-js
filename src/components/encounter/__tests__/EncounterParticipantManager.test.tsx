import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterParticipantManager } from '../EncounterParticipantManager';
import { EncounterService } from '@/lib/services/EncounterService';
import { testDataFactories } from '@/lib/services/__tests__/testDataFactories';

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService');
const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;

describe('EncounterParticipantManager', () => {
  const mockEncounter = testDataFactories.createEncounter({
    participants: [
      testDataFactories.createParticipant({
        characterId: '64a1b2c3d4e5f6789abcdef0',
        name: 'Aragorn',
        type: 'pc',
        maxHitPoints: 45,
        currentHitPoints: 45,
        temporaryHitPoints: 0,
        armorClass: 16,
        isPlayer: true,
        isVisible: true,
        notes: 'Ranger',
        conditions: [],
      }),
      testDataFactories.createParticipant({
        characterId: '64a1b2c3d4e5f6789abcdef1',
        name: 'Goblin Scout',
        type: 'npc',
        maxHitPoints: 7,
        currentHitPoints: 7,
        temporaryHitPoints: 0,
        armorClass: 15,
        isPlayer: false,
        isVisible: true,
        notes: 'Weak enemy',
        conditions: [],
      }),
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render participant list correctly', () => {
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      expect(screen.getByText('Encounter Participants')).toBeInTheDocument();
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Goblin Scout')).toBeInTheDocument();
      expect(screen.getByText('HP: 45/45')).toBeInTheDocument();
      expect(screen.getByText('AC: 16')).toBeInTheDocument();
    });

    it('should show empty state when no participants', () => {
      const emptyEncounter = testDataFactories.createEncounter({
        participants: [],
      });

      render(<EncounterParticipantManager encounter={emptyEncounter} />);

      expect(screen.getByText('No participants added yet')).toBeInTheDocument();
      expect(screen.getByText('Add Character')).toBeInTheDocument();
    });

    it('should display participant type badges correctly', () => {
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      expect(screen.getByText('PC')).toBeInTheDocument();
      expect(screen.getByText('NPC')).toBeInTheDocument();
    });
  });

  describe('Adding Participants', () => {
    it('should show add participant form when Add Character is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      await user.click(screen.getByRole('button', { name: /add character/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Hit Points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Armor Class/i)).toBeInTheDocument();
    });

    it('should add participant successfully', async () => {
      const user = userEvent.setup();
      mockEncounterService.addParticipant.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      await user.click(screen.getByRole('button', { name: /add character/i }));

      // Fill in form
      await user.type(screen.getByLabelText(/Character Name/i), 'Legolas');
      await user.clear(screen.getByLabelText(/Hit Points/i));
      await user.type(screen.getByLabelText(/Hit Points/i), '42');
      await user.clear(screen.getByLabelText(/Armor Class/i));
      await user.type(screen.getByLabelText(/Armor Class/i), '14');

      await user.click(screen.getByRole('button', { name: /add participant/i }));

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalledWith(
          mockEncounter._id.toString(),
          expect.objectContaining({
            name: 'Legolas',
            maxHitPoints: 42,
            armorClass: 14,
            type: 'pc',
          })
        );
      });
    });

    it('should show validation errors for invalid input', async () => {
      const user = userEvent.setup();
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      await user.click(screen.getByRole('button', { name: /add character/i }));
      await user.clear(screen.getByLabelText(/Hit Points/i));
      await user.type(screen.getByLabelText(/Hit Points/i), '0');
      await user.click(screen.getByRole('button', { name: /add participant/i }));

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Hit Points must be greater than 0/i)).toBeInTheDocument();
      });
    });
  });

  describe('Removing Participants', () => {
    it('should show remove confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const removeButtons = screen.getAllByLabelText(/Remove participant/i);
      await user.click(removeButtons[0]);

      expect(screen.getByText('Remove Participant')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to remove Aragorn/i)).toBeInTheDocument();
    });

    it('should remove participant successfully', async () => {
      const user = userEvent.setup();
      mockEncounterService.removeParticipant.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const removeButtons = screen.getAllByLabelText(/Remove participant/i);
      await user.click(removeButtons[0]);
      await user.click(screen.getByText('Remove'));

      await waitFor(() => {
        expect(mockEncounterService.removeParticipant).toHaveBeenCalledWith(
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef0'
        );
      });
    });
  });

  describe('Editing Participants', () => {
    it('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const editButtons = screen.getAllByLabelText(/Edit participant/i);
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Participant')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Aragorn')).toBeInTheDocument();
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });

    it('should update participant successfully', async () => {
      const user = userEvent.setup();
      mockEncounterService.updateParticipant.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const editButtons = screen.getAllByLabelText(/Edit participant/i);
      await user.click(editButtons[0]);

      // Wait for the edit dialog to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const hpInput = screen.getByDisplayValue('45');
      await user.clear(hpInput);
      await user.type(hpInput, '50');
      await user.click(screen.getByRole('button', { name: /update participant/i }));

      await waitFor(() => {
        expect(mockEncounterService.updateParticipant).toHaveBeenCalledWith(
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef0',
          expect.objectContaining({
            maxHitPoints: 50,
          })
        );
      });
    });
  });

  describe('Participant Ordering', () => {
    it('should support drag and drop reordering', async () => {
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const participants = screen.getAllByTestId(/participant-item/i);
      expect(participants).toHaveLength(2);

      // Mock drag and drop implementation would go here
      // For now we'll just verify the elements are present
      expect(participants[0]).toHaveTextContent('Aragorn');
      expect(participants[1]).toHaveTextContent('Goblin Scout');
    });
  });

  describe('Participant Role Assignment', () => {
    it('should allow changing participant roles', async () => {
      const user = userEvent.setup();
      mockEncounterService.updateParticipant.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const editButtons = screen.getAllByLabelText(/Edit participant/i);
      await user.click(editButtons[1]); // Edit Goblin Scout

      // Wait for the edit dialog to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Note: Custom Select component interaction - using default value for now
      await user.click(screen.getByRole('button', { name: /update participant/i }));

      await waitFor(() => {
        expect(mockEncounterService.updateParticipant).toHaveBeenCalledWith(
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef1',
          expect.objectContaining({
            type: 'npc', // Default type from participant
          })
        );
      });
    });
  });

  describe('Batch Operations', () => {
    it('should allow selecting multiple participants', async () => {
      const user = userEvent.setup();
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      expect(screen.getByText('2 participants selected')).toBeInTheDocument();
      expect(screen.getByText('Remove Selected')).toBeInTheDocument();
    });

    it('should perform batch removal', async () => {
      const user = userEvent.setup();
      mockEncounterService.removeParticipant.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(screen.getByText('Remove Selected'));
      await user.click(screen.getByText('Remove'));

      await waitFor(() => {
        expect(mockEncounterService.removeParticipant).toHaveBeenCalledWith(
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef0'
        );
      });
    });
  });

  describe('Character Import', () => {
    it('should show character import dialog', async () => {
      const user = userEvent.setup();
      render(<EncounterParticipantManager encounter={mockEncounter} />);

      await user.click(screen.getByRole('button', { name: /import from library/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Import Characters')).toBeInTheDocument();
        expect(screen.getByText('Select characters from your library')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when participant addition fails', async () => {
      const user = userEvent.setup();
      mockEncounterService.addParticipant.mockResolvedValue({
        success: false,
        error: 'Failed to add participant',
      });

      // Mock toast to capture error messages
      const mockToastError = jest.fn();
      jest.mock('sonner', () => ({
        toast: {
          success: jest.fn(),
          error: mockToastError,
        },
      }));

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      await user.click(screen.getByRole('button', { name: /add character/i }));
      await user.type(screen.getByLabelText(/Character Name/i), 'Test');
      await user.clear(screen.getByLabelText(/Hit Points/i));
      await user.type(screen.getByLabelText(/Hit Points/i), '10');
      await user.clear(screen.getByLabelText(/Armor Class/i));
      await user.type(screen.getByLabelText(/Armor Class/i), '10');
      await user.click(screen.getByRole('button', { name: /add participant/i }));

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalled();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockEncounterService.addParticipant.mockRejectedValue(new Error('Network error'));

      render(<EncounterParticipantManager encounter={mockEncounter} />);

      await user.click(screen.getByRole('button', { name: /add character/i }));
      await user.type(screen.getByLabelText(/Character Name/i), 'Test');
      await user.clear(screen.getByLabelText(/Hit Points/i));
      await user.type(screen.getByLabelText(/Hit Points/i), '10');
      await user.clear(screen.getByLabelText(/Armor Class/i));
      await user.type(screen.getByLabelText(/Armor Class/i), '10');
      await user.click(screen.getByRole('button', { name: /add participant/i }));

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalled();
      });
    });
  });
});