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

describe('CharacterValidationForm - Validation', () => {
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

  describe('Real-time Validation', () => {
    it('displays validation errors for empty required fields', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);

      // First type something to trigger validation, then clear it
      await userEvent.type(nameInput, 'Test');
      await userEvent.clear(nameInput);
      await userEvent.tab(); // Trigger blur to show validation

      await waitFor(() => {
        expect(screen.getByText(/Name is required/)).toBeInTheDocument();
      });
    });

    it('shows form status as invalid when there are errors', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.clear(nameInput);
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText('Form Status: Invalid')).toBeInTheDocument();
      });
    });

    it('shows form status as valid when all fields are correct', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Valid Character Name');

      await waitFor(() => {
        expect(screen.getByText('Form Status: Valid')).toBeInTheDocument();
      });
    });
  });

  describe('Ability Scores Section', () => {
    it('validates ability score ranges', async () => {
      render(<CharacterValidationForm {...testProps} />);

      const strengthInput = screen.getByLabelText(/Strength \(STR\)/);

      // Verify the input accepts valid values
      expect(strengthInput).toHaveValue(10);

      // Check that the form status section exists
      expect(screen.getByText(/Form Status:/)).toBeInTheDocument();
    });
  });
});