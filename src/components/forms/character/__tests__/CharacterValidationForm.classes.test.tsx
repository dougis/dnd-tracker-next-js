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

describe('CharacterValidationForm - Classes', () => {
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

  describe('Classes Section', () => {
    it('adds and removes character classes', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Should start with one class
      expect(screen.getByText('Class 1 (Primary)')).toBeInTheDocument();

      // Add a second class
      await userEvent.click(screen.getByText('Add Class'));

      await waitFor(() => {
        expect(screen.getByText('Class 2')).toBeInTheDocument();
      });

      // Remove the second class - look for button with X icon and sr-only text
      // Only non-primary classes should have remove buttons
      const removeButtons = screen.getAllByRole('button').filter(button =>
        button.querySelector('.sr-only')?.textContent === 'Remove class'
      );
      // Now that we have 2 classes, both should have remove buttons (component logic changed)
      expect(removeButtons.length).toBeGreaterThan(0);
      await userEvent.click(removeButtons[removeButtons.length - 1]); // Click the last remove button

      await waitFor(() => {
        expect(screen.queryByText('Class 2')).not.toBeInTheDocument();
      });
    });

    it('auto-updates hit die when class changes', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Find the character class select by label
      const classSelect = screen.getByRole('combobox', { name: /Character Class/ });
      await userEvent.click(classSelect);

      // Wait for dropdown to open and click Barbarian option
      await waitFor(() => {
        expect(screen.getByText('Barbarian')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Barbarian'));

      // Hit die should auto-update to 12 for barbarian
      await waitFor(() => {
        const hitDieInput = screen.getByLabelText(/Hit Die/);
        expect(hitDieInput).toHaveValue(12);
      });
    });

    it('prevents adding more than 3 classes', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Add maximum classes (starts with 1, add 2 more to reach 3)
      const addButton = screen.getByRole('button', { name: /Add Class/ });
      await userEvent.click(addButton);
      await userEvent.click(addButton);

      // Button should be disabled after reaching 3 classes
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Add Class/ });
        expect(button).toBeDisabled();
      });

      // Should show 3 classes
      expect(screen.getByText('Class 1 (Primary)')).toBeInTheDocument();
      expect(screen.getByText('Class 2')).toBeInTheDocument();
      expect(screen.getByText('Class 3')).toBeInTheDocument();
    });
  });
});