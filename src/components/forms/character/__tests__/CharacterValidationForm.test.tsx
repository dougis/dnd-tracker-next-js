import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterValidationForm } from '../CharacterValidationForm';
import { CharacterService } from '@/lib/services/CharacterService';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService');
const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CharacterValidationForm', () => {
  const defaultProps = {
    ownerId: 'test-owner-id',
    isOpen: true,
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCharacterService.createCharacter.mockResolvedValue({
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
    });
  });

  describe('Form Rendering', () => {
    it('renders the form modal when open', () => {
      render(<CharacterValidationForm {...defaultProps} />);

      expect(screen.getByText('Create Character')).toBeInTheDocument();
      expect(screen.getByText('Build your character with real-time validation')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<CharacterValidationForm {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Create Character')).not.toBeInTheDocument();
    });

    it('renders all form sections', () => {
      render(<CharacterValidationForm {...defaultProps} />);

      expect(screen.getByTestId('basic-info-validation-section')).toBeInTheDocument();
      expect(screen.getByTestId('ability-scores-validation-section')).toBeInTheDocument();
      expect(screen.getByTestId('classes-validation-section')).toBeInTheDocument();
      expect(screen.getByTestId('combat-stats-validation-section')).toBeInTheDocument();
    });
  });

  describe('Real-time Validation', () => {
    it('displays validation errors for empty required fields', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.clear(nameInput);
      await userEvent.tab(); // Trigger blur to show validation

      await waitFor(() => {
        expect(screen.getByText(/String must contain at least 1 character/)).toBeInTheDocument();
      });
    });

    it('shows form status as invalid when there are errors', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.clear(nameInput);
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText('Form Status: Invalid')).toBeInTheDocument();
      });
    });

    it('shows form status as valid when all fields are correct', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Valid Character Name');

      await waitFor(() => {
        expect(screen.getByText('Form Status: Valid')).toBeInTheDocument();
      });
    });
  });

  describe('Basic Info Section', () => {
    it('updates character name field', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Aragorn');

      expect(nameInput).toHaveValue('Aragorn');
      expect(screen.getByText('7/100')).toBeInTheDocument(); // Character count
    });

    it('handles custom race input', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const raceSelect = screen.getByDisplayValue('Human');
      await userEvent.click(raceSelect);
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
      render(<CharacterValidationForm {...defaultProps} />);

      const sizeSelect = screen.getByDisplayValue('Medium');
      await userEvent.click(sizeSelect);
      await userEvent.click(screen.getByText('Large'));

      expect(screen.getByDisplayValue('Large')).toBeInTheDocument();
    });
  });

  describe('Ability Scores Section', () => {
    it('updates ability scores and shows modifiers', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const strengthInput = screen.getByLabelText(/Strength \(STR\)/);
      await userEvent.clear(strengthInput);
      await userEvent.type(strengthInput, '16');

      expect(strengthInput).toHaveValue(16);
      // Should show +3 modifier for score of 16
      await waitFor(() => {
        expect(screen.getByText('+3')).toBeInTheDocument();
      });
    });

    it('validates ability score ranges', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const strengthInput = screen.getByLabelText(/Strength \(STR\)/);
      await userEvent.clear(strengthInput);
      await userEvent.type(strengthInput, '0'); // Invalid value
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/Number must be greater than or equal to 1/)).toBeInTheDocument();
      });
    });
  });

  describe('Classes Section', () => {
    it('adds and removes character classes', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      // Should start with one class
      expect(screen.getByText('Class 1 (Primary)')).toBeInTheDocument();

      // Add a second class
      await userEvent.click(screen.getByText('Add Class'));

      await waitFor(() => {
        expect(screen.getByText('Class 2')).toBeInTheDocument();
      });

      // Remove the second class
      const removeButtons = screen.getAllByLabelText(/Remove class/);
      await userEvent.click(removeButtons[1]);

      await waitFor(() => {
        expect(screen.queryByText('Class 2')).not.toBeInTheDocument();
      });
    });

    it('auto-updates hit die when class changes', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const classSelect = screen.getByDisplayValue('Fighter');
      await userEvent.click(classSelect);
      await userEvent.click(screen.getByText('Barbarian'));

      // Hit die should auto-update to 12 for barbarian
      await waitFor(() => {
        const hitDieInput = screen.getByDisplayValue('12');
        expect(hitDieInput).toBeInTheDocument();
      });
    });

    it('prevents adding more than 3 classes', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      // Add maximum classes
      await userEvent.click(screen.getByText('Add Class'));
      await userEvent.click(screen.getByText('Add Class'));

      // Button should be disabled
      await waitFor(() => {
        expect(screen.getByText('Add Class')).toBeDisabled();
      });
    });
  });

  describe('Combat Stats Section', () => {
    it('updates hit points values', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const maxHpInput = screen.getByLabelText(/Maximum HP/);
      await userEvent.clear(maxHpInput);
      await userEvent.type(maxHpInput, '15');

      expect(maxHpInput).toHaveValue(15);

      const currentHpInput = screen.getByLabelText(/Current HP/);
      await userEvent.clear(currentHpInput);
      await userEvent.type(currentHpInput, '12');

      expect(currentHpInput).toHaveValue(12);
    });

    it('shows combat summary', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      // Should show combat summary section
      expect(screen.getByText('Combat Summary')).toBeInTheDocument();
      expect(screen.getByText(/HP:/)).toBeInTheDocument();
      expect(screen.getByText(/AC:/)).toBeInTheDocument();
      expect(screen.getByText(/Speed:/)).toBeInTheDocument();
      expect(screen.getByText(/Prof:/)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      // Fill in required fields
      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Test Character');

      // Submit the form
      await userEvent.click(screen.getByText('Create Character'));

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

      expect(defaultProps.onSuccess).toHaveBeenCalled();
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

      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Test Character');

      await userEvent.click(screen.getByText('Create Character'));

      await waitFor(() => {
        expect(screen.getByText(/Failed to create character: Invalid character data/)).toBeInTheDocument();
        expect(screen.getByText(/Details: Name is required/)).toBeInTheDocument();
      });
    });

    it('prevents submission when form is invalid', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      // Clear required field to make form invalid
      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.clear(nameInput);

      // Submit button should be disabled or not functional
      await userEvent.click(screen.getByText('Create Character'));

      // Should not call the service
      expect(mockCharacterService.createCharacter).not.toHaveBeenCalled();
    });

    it('shows loading state during submission', async () => {
      // Mock a delayed response
      mockCharacterService.createCharacter.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: expect.any(Object),
        }), 100))
      );

      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Test Character');

      await userEvent.click(screen.getByText('Create Character'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Create Character')).toBeDisabled();
      });
    });
  });

  describe('Character Preview', () => {
    it('updates preview when form values change', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Character Name/);
      await userEvent.type(nameInput, 'Preview Character');

      // Preview should update with the new name
      await waitFor(() => {
        expect(screen.getByText('Preview Character')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      render(<CharacterValidationForm {...defaultProps} />);

      await userEvent.click(screen.getByText('Cancel'));

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when modal is closed', async () => {
      const { rerender } = render(<CharacterValidationForm {...defaultProps} />);

      rerender(<CharacterValidationForm {...defaultProps} isOpen={false} />);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Initial Values', () => {
    it('pre-populates form with initial values', () => {
      const initialValues = {
        name: 'Pre-filled Character',
        type: 'npc' as const,
        race: 'elf' as const,
        size: 'small' as const,
      };

      render(
        <CharacterValidationForm
          {...defaultProps}
          initialValues={initialValues}
        />
      );

      expect(screen.getByDisplayValue('Pre-filled Character')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Non-Player Character')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Elf')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Small')).toBeInTheDocument();
    });
  });
});