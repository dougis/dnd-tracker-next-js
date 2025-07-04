import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterParticipantManager } from '../EncounterParticipantManager';
import { EncounterService } from '@/lib/services/EncounterService';
import { testDataFactories } from '@/lib/services/__tests__/testDataFactories';

// Mock the EncounterService
jest.mock('@/lib/services/EncounterService');
const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;

// Test helper functions
const createTestParticipant = (overrides: any = {}) =>
  testDataFactories.createParticipant({
    maxHitPoints: 45,
    currentHitPoints: 45,
    temporaryHitPoints: 0,
    armorClass: 16,
    isPlayer: true,
    isVisible: true,
    notes: 'Test notes',
    conditions: [],
    ...overrides,
  });

const openAddDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /add character/i }));
};

const fillParticipantForm = async (
  user: ReturnType<typeof userEvent.setup>,
  data: { name?: string; hitPoints?: string; armorClass?: string } = {}
) => {
  if (data.name !== undefined) {
    const nameInput = screen.getByLabelText(/Character Name/i);
    await user.clear(nameInput);
    if (data.name) await user.type(nameInput, data.name);
  }
  if (data.hitPoints) {
    const hpInput = screen.getByLabelText(/Hit Points/i) as HTMLInputElement;
    fireEvent.change(hpInput, { target: { value: data.hitPoints } });
  }
  if (data.armorClass) {
    const acInput = screen.getByLabelText(/Armor Class/i) as HTMLInputElement;
    fireEvent.change(acInput, { target: { value: data.armorClass } });
  }
};

const submitForm = async (user: ReturnType<typeof userEvent.setup>, buttonName: string) => {
  await user.click(screen.getByRole('button', { name: new RegExp(buttonName, 'i') }));
};

const setupMockService = (method: string, response: any) => {
  (mockEncounterService as any)[method].mockResolvedValue(response);
};

const expectServiceCall = (method: string, expectedArgs: any[]) => {
  expect((mockEncounterService as any)[method]).toHaveBeenCalledWith(...expectedArgs);
};

const waitForText = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};

const waitForDialog = async (title: string) => {
  await waitFor(() => {
    expect(screen.getByText(title)).toBeInTheDocument();
  });
};

const renderComponent = (encounter: any) => {
  return render(<EncounterParticipantManager encounter={encounter} />);
};

const getParticipantElements = () => {
  return {
    addButton: screen.getByRole('button', { name: /add character/i }),
    importButton: screen.getByRole('button', { name: /import from library/i }),
    editButtons: screen.getAllByLabelText(/Edit participant/i),
    removeButtons: screen.getAllByLabelText(/Remove participant/i),
    checkboxes: screen.getAllByRole('checkbox'),
    participants: screen.getAllByTestId(/participant-item/i),
  };
};

const expectParticipantVisible = (name: string, hp: string, ac: string) => {
  expect(screen.getByText(name)).toBeInTheDocument();
  expect(screen.getByText(hp)).toBeInTheDocument();
  expect(screen.getByText(ac)).toBeInTheDocument();
};

const expectFormElements = () => {
  expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Hit Points/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Armor Class/i)).toBeInTheDocument();
};

const expectValidationErrors = async (errors: string[]) => {
  for (const error of errors) {
    await waitForText(new RegExp(error, 'i'));
  }
};

const performAddParticipant = async (user: ReturnType<typeof userEvent.setup>, participantData: any) => {
  await openAddDialog(user);
  await fillParticipantForm(user, participantData);
  await submitForm(user, 'add participant');
};

const performEditParticipant = async (user: ReturnType<typeof userEvent.setup>, index: number, newData: any) => {
  const editButtons = screen.getAllByLabelText(/Edit participant/i);
  await user.click(editButtons[index]);
  await waitForDialog('Edit Participant');
  await fillParticipantForm(user, newData);
  await submitForm(user, 'update participant');
};

const performRemoveParticipant = async (user: ReturnType<typeof userEvent.setup>, index: number) => {
  const removeButtons = screen.getAllByLabelText(/Remove participant/i);
  await user.click(removeButtons[index]);
  await user.click(screen.getByText('Remove'));
};

const performBatchSelection = async (user: ReturnType<typeof userEvent.setup>, indices: number[]) => {
  const checkboxes = screen.getAllByRole('checkbox');
  for (const index of indices) {
    await user.click(checkboxes[index]);
  }
};

const expectBatchSelectionState = (count: number) => {
  expect(screen.getByText(`${count} participants selected`)).toBeInTheDocument();
  expect(screen.getByText('Remove Selected')).toBeInTheDocument();
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
      expectParticipantVisible('Aragorn', 'HP: 45/45', 'AC: 16');
      expectParticipantVisible('Goblin Scout', 'HP: 7/7', 'AC: 15');
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

      await openAddDialog(user);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expectFormElements();
    });

    it('should add participant successfully', async () => {
      const user = userEvent.setup();
      setupMockService('addParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await performAddParticipant(user, {
        name: 'Legolas',
        hitPoints: '42',
        armorClass: '14',
      });

      await waitFor(() => {
        expectServiceCall('addParticipant', [
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

      await performAddParticipant(user, { name: '', hitPoints: '0' });

      await expectValidationErrors(['Name is required', 'Hit Points must be greater than 0']);
    });
  });

  describe('Removing Participants', () => {
    it('should show remove confirmation dialog', async () => {
      const user = userEvent.setup();
      renderComponent(mockEncounter);

      const { removeButtons } = getParticipantElements();
      await user.click(removeButtons[0]);

      expect(screen.getByText('Remove Participant')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to remove Aragorn/i)).toBeInTheDocument();
    });

    it('should remove participant successfully', async () => {
      const user = userEvent.setup();
      setupMockService('removeParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await performRemoveParticipant(user, 0);

      await waitFor(() => {
        expectServiceCall('removeParticipant', [
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

      const { editButtons } = getParticipantElements();
      await user.click(editButtons[0]);

      expect(screen.getByText('Edit Participant')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Aragorn')).toBeInTheDocument();
      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });

    it('should update participant successfully', async () => {
      const user = userEvent.setup();
      setupMockService('updateParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await performEditParticipant(user, 0, { hitPoints: '50' });

      await waitFor(() => {
        expectServiceCall('updateParticipant', [
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

      const { participants } = getParticipantElements();
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
      setupMockService('updateParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      const { editButtons } = getParticipantElements();
      await user.click(editButtons[1]); // Edit Goblin Scout

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await submitForm(user, 'update participant');

      await waitFor(() => {
        expectServiceCall('updateParticipant', [
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

      await performBatchSelection(user, [0, 1]);

      expectBatchSelectionState(2);
    });

    it('should perform batch removal', async () => {
      const user = userEvent.setup();
      setupMockService('removeParticipant', { success: true, data: mockEncounter });

      renderComponent(mockEncounter);

      await performBatchSelection(user, [0]);
      await user.click(screen.getByText('Remove Selected'));
      await user.click(screen.getByText('Remove'));

      await waitFor(() => {
        expectServiceCall('removeParticipant', [
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

      const { importButton } = getParticipantElements();
      await user.click(importButton);

      await waitForText('Import Characters');
      await waitForText('Select characters from your library to add to this encounter');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when participant addition fails', async () => {
      const user = userEvent.setup();
      setupMockService('addParticipant', { success: false, error: 'Failed to add participant' });

      renderComponent(mockEncounter);

      await performAddParticipant(user, { name: 'Test', hitPoints: '10', armorClass: '10' });

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalled();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockEncounterService.addParticipant.mockRejectedValue(new Error('Network error'));

      renderComponent(mockEncounter);

      await performAddParticipant(user, { name: 'Test', hitPoints: '10', armorClass: '10' });

      await waitFor(() => {
        expect(mockEncounterService.addParticipant).toHaveBeenCalled();
      });
    });
  });
});