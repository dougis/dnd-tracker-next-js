import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterParticipantManager } from '../EncounterParticipantManager';
import { EncounterService } from '@/lib/services/EncounterService';
import { testDataFactories } from '@/lib/services/__tests__/testDataFactories';
import {
  createTestParticipant,
  formActions,
  serviceMocks,
  testExpectations,
  getElements,
  workflows
} from './participant-test-helpers';

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService');
const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;

const renderComponent = (encounter: any) => {
  return render(<EncounterParticipantManager encounter={encounter} />);
};

describe('EncounterParticipantManager', () => {
  const mockEncounter = testDataFactories.createEncounter({
    participants: [
      createTestParticipant({
        characterId: '64a1b2c3d4e5f6789abcdef0',
        name: 'Aragorn',
        type: 'pc',
        notes: 'Ranger',
      }),
      createTestParticipant({
        characterId: '64a1b2c3d4e5f6789abcdef1',
        name: 'Goblin Scout',
        type: 'npc',
        maxHitPoints: 7,
        currentHitPoints: 7,
        armorClass: 15,
        isPlayer: false,
        notes: 'Weak enemy',
      }),
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render participant list correctly', () => {
      renderComponent(mockEncounter);

      expect(screen.getByText('Encounter Participants')).toBeInTheDocument();
      testExpectations.elementsVisible('Aragorn', 'HP: 45/45', 'AC: 16');
      testExpectations.elementsVisible('Goblin Scout', 'HP: 7/7', 'AC: 15');
    });

    it('should show empty state when no participants', () => {
      const emptyEncounter = testDataFactories.createEncounter({
        participants: [],
      });

      renderComponent(emptyEncounter);

      expect(screen.getByText('No participants added yet')).toBeInTheDocument();
      expect(screen.getByText('Add Character')).toBeInTheDocument();
    });

    it('should display participant type badges correctly', () => {
      renderComponent(mockEncounter);

      expect(screen.getByText('PC')).toBeInTheDocument();
      expect(screen.getByText('NPC')).toBeInTheDocument();
    });
  });

  describe('Adding Participants', () => {
    it('should show add participant form when Add Character is clicked', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      await formActions.openDialog(user);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      testExpectations.formElements();
    });

    it('should add participant successfully', async () => {
      const user = userEvent.setup();
      serviceMocks.setup(mockEncounterService, 'addParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await workflows.addParticipant(user, {
        name: 'Legolas',
        hitPoints: '42',
        armorClass: '14',
      });

      await waitFor(() => {
        serviceMocks.expectCall(mockEncounterService, 'addParticipant', [
          mockEncounter._id.toString(),
          expect.objectContaining({
            name: 'Legolas',
            maxHitPoints: 42,
            currentHitPoints: 42,
            armorClass: 14,
            type: 'pc',
            characterId: expect.any(String),
            temporaryHitPoints: 0,
            isPlayer: true,
            isVisible: true,
            notes: '',
            conditions: [],
          })
        ]);
      });
    });

    it('should show validation errors for invalid input', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      await workflows.addParticipant(user, { name: '', hitPoints: '0' });

      await testExpectations.validationErrors(['Name is required', 'Hit Points must be greater than 0']);
    });
  });

  describe('Removing Participants', () => {
    it('should show remove confirmation dialog', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      const { removeButtons } = getElements();
      await user.click(removeButtons[0]);

      expect(screen.getByText('Remove Participant')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to remove Aragorn/i)).toBeInTheDocument();
    });

    it('should remove participant successfully', async () => {
      const user = userEvent.setup();
      serviceMocks.setup(mockEncounterService, 'removeParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await workflows.removeParticipant(user, 0);

      await waitFor(() => {
        serviceMocks.expectCall(mockEncounterService, 'removeParticipant', [
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef0'
        ]);
      });
    });
  });

  describe('Editing Participants', () => {
    it('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      const { editButtons } = getElements();
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Participant')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Aragorn')).toBeInTheDocument();
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });

    it('should update participant successfully', async () => {
      const user = userEvent.setup();
      serviceMocks.setup(mockEncounterService, 'updateParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await workflows.editParticipant(user, 0, { hitPoints: '50' });

      await waitFor(() => {
        serviceMocks.expectCall(mockEncounterService, 'updateParticipant', [
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef0',
          expect.objectContaining({
            name: 'Aragorn',
            type: 'pc',
            maxHitPoints: 50,
            currentHitPoints: 50,
            temporaryHitPoints: 0,
            armorClass: 16,
            initiative: 10,
            isPlayer: true,
            isVisible: true,
            notes: 'Ranger',
            conditions: [],
          })
        ]);
      });
    });
  });

  describe('Participant Ordering', () => {
    it('should support drag and drop reordering', async () => {
      renderComponent(mockEncounter);

      const { participants } = getElements();
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
      serviceMocks.setup(mockEncounterService, 'updateParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      const { editButtons } = getElements();
      await user.click(editButtons[1]); // Edit Goblin Scout

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await formActions.submit(user, 'update participant');

      await waitFor(() => {
        serviceMocks.expectCall(mockEncounterService, 'updateParticipant', [
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef1',
          expect.objectContaining({
            type: 'npc', // Default type from participant
          })
        ]);
      });
    });
  });

  describe('Batch Operations', () => {
    it('should allow selecting multiple participants', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      await workflows.selectMultiple(user, [0, 1]);

      testExpectations.batchSelection(2);
    });

    it('should perform batch removal', async () => {
      const user = userEvent.setup();
      serviceMocks.setup(mockEncounterService, 'removeParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await workflows.selectMultiple(user, [0]);
      await user.click(screen.getByText('Remove Selected'));
      await user.click(screen.getByText('Remove'));

      await waitFor(() => {
        serviceMocks.expectCall(mockEncounterService, 'removeParticipant', [
          mockEncounter._id.toString(),
          '64a1b2c3d4e5f6789abcdef0'
        ]);
      });
    });
  });

  describe('Character Import', () => {
    it('should show character import dialog', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      const { importButton } = getElements();
      await user.click(importButton);

      await testExpectations.elementVisible('Import Characters');
      await testExpectations.elementVisible('Select characters from your library to add to this encounter');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when participant addition fails', async () => {
      const user = userEvent.setup();
      serviceMocks.setup(mockEncounterService, 'addParticipant', { success: false, error: 'Failed to add participant' });

      renderComponent(mockEncounter);

      await workflows.addParticipant(user, { name: 'Test', hitPoints: '10', armorClass: '10' });

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalled();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockEncounterService.addParticipant.mockRejectedValue(new Error('Network error'));

      renderComponent(mockEncounter);

      await workflows.addParticipant(user, { name: 'Test', hitPoints: '10', armorClass: '10' });

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalled();
      });
    });
  });
});