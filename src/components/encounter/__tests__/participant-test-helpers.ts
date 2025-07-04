import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testDataFactories } from '@/lib/services/__tests__/testDataFactories';

export const createTestParticipant = (overrides: any = {}) =>
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

export const formHelpers = {
  async openAddDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /add character/i }));
  },

  async fillParticipantForm(
    user: ReturnType<typeof userEvent.setup>,
    data: { name?: string; hitPoints?: string; armorClass?: string } = {}
  ) {
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
  },

  async submitForm(user: ReturnType<typeof userEvent.setup>, buttonName: string) {
    await user.click(screen.getByRole('button', { name: new RegExp(buttonName, 'i') }));
  }
};

export const serviceHelpers = {
  setupMock(mockService: any, method: string, response: any) {
    (mockService as any)[method].mockResolvedValue(response);
  },

  expectCall(mockService: any, method: string, expectedArgs: any[]) {
    expect((mockService as any)[method]).toHaveBeenCalledWith(...expectedArgs);
  }
};

export const waitHelpers = {
  async forText(text: string | RegExp) {
    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  },

  async forDialog(title: string) {
    await waitFor(() => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  }
};

export const participantHelpers = {
  getElements() {
    return {
      addButton: screen.getByRole('button', { name: /add character/i }),
      importButton: screen.getByRole('button', { name: /import from library/i }),
      editButtons: screen.getAllByLabelText(/Edit participant/i),
      removeButtons: screen.getAllByLabelText(/Remove participant/i),
      checkboxes: screen.getAllByRole('checkbox'),
      participants: screen.getAllByTestId(/participant-item/i),
    };
  },

  expectVisible(name: string, hp: string, ac: string) {
    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByText(hp)).toBeInTheDocument();
    expect(screen.getByText(ac)).toBeInTheDocument();
  },

  expectFormElements() {
    expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hit Points/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Armor Class/i)).toBeInTheDocument();
  },

  async expectValidationErrors(errors: string[]) {
    for (const error of errors) {
      await waitHelpers.forText(new RegExp(error, 'i'));
    }
  }
};

export const workflowHelpers = {
  async addParticipant(user: ReturnType<typeof userEvent.setup>, participantData: any) {
    await formHelpers.openAddDialog(user);
    await formHelpers.fillParticipantForm(user, participantData);
    await formHelpers.submitForm(user, 'add participant');
  },

  async editParticipant(user: ReturnType<typeof userEvent.setup>, index: number, newData: any) {
    const editButtons = screen.getAllByLabelText(/Edit participant/i);
    await user.click(editButtons[index]);
    await waitHelpers.forDialog('Edit Participant');
    await formHelpers.fillParticipantForm(user, newData);
    await formHelpers.submitForm(user, 'update participant');
  },

  async removeParticipant(user: ReturnType<typeof userEvent.setup>, index: number) {
    const removeButtons = screen.getAllByLabelText(/Remove participant/i);
    await user.click(removeButtons[index]);
    await user.click(screen.getByText('Remove'));
  },

  async selectMultiple(user: ReturnType<typeof userEvent.setup>, indices: number[]) {
    const checkboxes = screen.getAllByRole('checkbox');
    for (const index of indices) {
      await user.click(checkboxes[index]);
    }
  },

  expectBatchSelection(count: number) {
    expect(screen.getByText(`${count} participants selected`)).toBeInTheDocument();
    expect(screen.getByText('Remove Selected')).toBeInTheDocument();
  }
};