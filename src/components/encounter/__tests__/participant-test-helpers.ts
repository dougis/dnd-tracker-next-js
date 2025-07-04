import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testDataFactories } from '@/lib/services/__tests__/testDataFactories';

// Default participant data
const DEFAULT_PARTICIPANT = {
  maxHitPoints: 45,
  currentHitPoints: 45,
  temporaryHitPoints: 0,
  armorClass: 16,
  isPlayer: true,
  isVisible: true,
  notes: 'Test notes',
  conditions: [],
};

// Participant factory
export const createTestParticipant = (overrides: any = {}) =>
  testDataFactories.createParticipant({ ...DEFAULT_PARTICIPANT, ...overrides });

// Generic async helper for common operations
const asyncHelper = {
  async click(user: ReturnType<typeof userEvent.setup>, selector: any) {
    await user.click(selector);
  },

  async waitForElement(text: string | RegExp) {
    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  },

  async fillInput(user: ReturnType<typeof userEvent.setup>, label: RegExp, value: string) {
    const input = screen.getByLabelText(label) as HTMLInputElement;
    fireEvent.change(input, { target: { value } });
  }
};

// Form operations
export const formActions = {
  async openDialog(user: ReturnType<typeof userEvent.setup>) {
    await asyncHelper.click(user, screen.getByRole('button', { name: /add character/i }));
  },

  async fillForm(user: ReturnType<typeof userEvent.setup>, data: Record<string, string>) {
    const fieldMap = {
      name: /Character Name/i,
      hitPoints: /Hit Points/i,
      armorClass: /Armor Class/i
    };

    for (const [key, value] of Object.entries(data)) {
      if (key === 'name' && value !== undefined) {
        const input = screen.getByLabelText(fieldMap.name);
        await user.clear(input);
        if (value) await user.type(input, value);
      } else if (fieldMap[key as keyof typeof fieldMap]) {
        await asyncHelper.fillInput(user, fieldMap[key as keyof typeof fieldMap], value);
      }
    }
  },

  async submit(user: ReturnType<typeof userEvent.setup>, buttonName: string) {
    await asyncHelper.click(user, screen.getByRole('button', { name: new RegExp(buttonName, 'i') }));
  }
};

// Test expectations
export const testExpectations = {
  elementsVisible(...texts: string[]) {
    texts.forEach(text => expect(screen.getByText(text)).toBeInTheDocument());
  },

  async elementVisible(text: string) {
    await asyncHelper.waitForElement(text);
  },

  formElements() {
    ['Character Name', 'Hit Points', 'Armor Class'].forEach(label => 
      expect(screen.getByLabelText(new RegExp(label, 'i'))).toBeInTheDocument()
    );
  },

  async validationErrors(errors: string[]) {
    for (const error of errors) {
      await asyncHelper.waitForElement(new RegExp(error, 'i'));
    }
  },

  batchSelection(count: number) {
    expect(screen.getByText(`${count} participants selected`)).toBeInTheDocument();
    expect(screen.getByText('Remove Selected')).toBeInTheDocument();
  }
};

// Service mock utilities
export const serviceMocks = {
  setup(mockService: any, method: string, response: any) {
    (mockService as any)[method].mockResolvedValue(response);
  },

  expectCall(mockService: any, method: string, expectedArgs: any[]) {
    expect((mockService as any)[method]).toHaveBeenCalledWith(...expectedArgs);
  }
};

// UI element getters
export const getElements = () => ({
  addButton: screen.getByRole('button', { name: /add character/i }),
  importButton: screen.getByRole('button', { name: /import from library/i }),
  editButtons: screen.getAllByLabelText(/Edit participant/i),
  removeButtons: screen.getAllByLabelText(/Remove participant/i),
  checkboxes: screen.getAllByRole('checkbox'),
  participants: screen.getAllByTestId(/participant-item/i),
});

// Complex workflow operations
export const workflows = {
  async addParticipant(user: ReturnType<typeof userEvent.setup>, data: Record<string, string>) {
    await formActions.openDialog(user);
    await formActions.fillForm(user, data);
    await formActions.submit(user, 'add participant');
  },

  async editParticipant(user: ReturnType<typeof userEvent.setup>, index: number, data: Record<string, string>) {
    const { editButtons } = getElements();
    await asyncHelper.click(user, editButtons[index]);
    await asyncHelper.waitForElement('Edit Participant');
    await formActions.fillForm(user, data);
    await formActions.submit(user, 'update participant');
  },

  async removeParticipant(user: ReturnType<typeof userEvent.setup>, index: number) {
    const { removeButtons } = getElements();
    await asyncHelper.click(user, removeButtons[index]);
    await asyncHelper.click(user, screen.getByText('Remove'));
  },

  async selectMultiple(user: ReturnType<typeof userEvent.setup>, indices: number[]) {
    const { checkboxes } = getElements();
    for (const index of indices) {
      await asyncHelper.click(user, checkboxes[index]);
    }
  }
};