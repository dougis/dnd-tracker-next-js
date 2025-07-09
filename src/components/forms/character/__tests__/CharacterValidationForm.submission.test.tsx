import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('CharacterValidationForm - Submission', () => {
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

  describe('Form Submission', () => {
    it('submits valid form data', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Fill in required fields
      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Test Character');

      // Submit the form
      await userEvent.click(screen.getByRole('button', { name: 'Create Character' }));

      await waitFor(() => {
        expect(mockCharacterService.createCharacter).toHaveBeenCalledWith(
          'test-owner-id',
          expect.objectContaining({
            name: 'Test Character',
            type: 'pc',
            race: 'human',
            size: 'medium',
          })
        );
      });

      expect(testProps.onSuccess).toHaveBeenCalled();
    });

    it('displays error message on submission failure', async () => {
      mockCharacterService.createCharacter.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid character data',
          details: 'Name is required',
        },
      });

      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Test Character');

      await userEvent.click(screen.getByRole('button', { name: 'Create Character' }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to create character: Invalid character data/)).toBeInTheDocument();
        expect(screen.getByText(/Details: Name is required/)).toBeInTheDocument();
      });
    });

    it('prevents submission when form is invalid', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Clear required field to make form invalid
      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.clear(nameInput);

      // Submit button should be disabled or not functional
      await userEvent.click(screen.getByRole('button', { name: 'Create Character' }));

      // Should not call the service
      expect(mockCharacterService.createCharacter).not.toHaveBeenCalled();
    });

    it('shows loading state during submission', async () => {
      // Mock a delayed response
      mockCharacterService.createCharacter.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {
            _id: 'test-character-id',
            name: 'Test Character',
            type: 'pc',
            race: 'human',
            size: 'medium',
            classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
            abilityScores: {
              strength: 15,
              dexterity: 14,
              constitution: 13,
              intelligence: 12,
              wisdom: 10,
              charisma: 8,
            },
            hitPoints: { maximum: 10, current: 10, temporary: 0 },
            armorClass: 16,
            speed: 30,
            proficiencyBonus: 2,
            savingThrows: {
              strength: false,
              dexterity: false,
              constitution: false,
              intelligence: false,
              wisdom: false,
              charisma: false,
            },
            skills: {},
            equipment: [],
            spells: [],
            ownerId: 'test-owner-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }), 100))
      );

      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Test Character');

      const submitButton = screen.getByRole('button', { name: 'Create Character' });
      await userEvent.click(submitButton);

      // Should show loading state immediately
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Creating/ })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});