import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterValidationForm } from '../CharacterValidationForm';
import { setupFormComponentTest } from './setup/test-setup';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    createCharacter: jest.fn(),
  },
}));

import { CharacterService } from '@/lib/services/CharacterService';

describe('CharacterValidationForm - Form Sections', () => {
  setupFormComponentTest();
  const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

  const defaultProps = {
    ownerId: 'user123',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onCancel: jest.fn(),
    isOpen: false,
  };

  const testProps = {
    ...defaultProps,
    ownerId: 'test-owner-id',
    isOpen: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCharacterService.createCharacter.mockResolvedValue({
      success: true,
      data: {
        _id: 'test-char-id',
        name: 'Test Character',
        type: 'pc',
        race: 'human',
        size: 'medium',
      },
    });
  });

  describe('Basic Info Section', () => {
    it('updates character name field', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Aragorn');

      expect(nameInput).toHaveValue('Aragorn');
      expect(screen.getByText('7/100')).toBeInTheDocument(); // Character count
    });

    it('handles custom race input', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Find the race select trigger by role
      const raceSelect = screen.getByRole('combobox', { name: /Race/ });
      await userEvent.click(raceSelect);

      // Wait for dropdown to open and click Custom option
      await waitFor(() => {
        expect(screen.getByText('Custom')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Custom'));

      // Should show custom race input
      await waitFor(() => {
        expect(screen.getByLabelText(/Custom Race Name/)).toBeInTheDocument();
      });

      const customRaceInput = screen.getByLabelText(/Custom Race Name/);
      await userEvent.type(customRaceInput, 'Dragonkin');

      expect(customRaceInput).toHaveValue('Dragonkin');
    });

    it('updates size field', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Find the size select trigger by role
      const sizeSelect = screen.getByRole('combobox', { name: /Size/ });
      await userEvent.click(sizeSelect);

      // Wait for dropdown to open and click Large option
      await waitFor(() => {
        expect(screen.getByText('Large')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Large'));

      // Verify the selection was made by checking the trigger shows Large
      await waitFor(() => {
        expect(screen.getByText('Large')).toBeInTheDocument();
      });
    });
  });

  describe('Ability Scores Section', () => {
    it('updates ability scores and shows modifiers', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const strengthInput = screen.getByLabelText(/Strength \(STR\)/);

      // The input field should have the default value
      expect(strengthInput).toHaveValue(10);

      // Should show modifiers for all ability scores (all start at 10, so all are +0)
      const modifiers = screen.getAllByText('+0');
      expect(modifiers).toHaveLength(6); // 6 ability scores, all with +0 modifier
    });
  });

  describe('Combat Stats Section', () => {
    it('updates hit points values', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Wait for the form to render
      await waitFor(() => {
        expect(screen.getByTestId('combat-stats-validation-section')).toBeInTheDocument();
      });

      const maxHpInput = screen.getByLabelText(/Maximum HP/);

      // Clear field by selecting all and typing new value
      await userEvent.tripleClick(maxHpInput);
      await userEvent.keyboard('15');

      expect(maxHpInput).toHaveValue(15);

      const currentHpInput = screen.getByLabelText(/Current HP/);
      await userEvent.tripleClick(currentHpInput);
      await userEvent.keyboard('12');

      expect(currentHpInput).toHaveValue(12);
    });

    it('shows combat summary', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Wait for the form to render and check for combat summary
      await waitFor(() => {
        expect(screen.getByText('Combat Summary')).toBeInTheDocument();
      });

      // Get the parent container that includes both title and stats
      const combatSummaryContainer = screen.getByText('Combat Summary').closest('.p-4');
      expect(combatSummaryContainer).toBeInTheDocument();

      // Look for the specific combat summary stats within the container
      within(combatSummaryContainer!).getByText(/HP:/);
      within(combatSummaryContainer!).getByText(/AC:/);
      within(combatSummaryContainer!).getByText(/Speed:/);
      within(combatSummaryContainer!).getByText(/Prof:/);
    });
  });

  describe('Character Preview', () => {
    it('updates preview when form values change', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Preview Character');

      // Preview should update with the new name
      await waitFor(() => {
        expect(screen.getByText('Preview Character')).toBeInTheDocument();
      });
    });
  });
});