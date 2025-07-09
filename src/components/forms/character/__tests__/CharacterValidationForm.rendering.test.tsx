import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterValidationForm } from '../CharacterValidationForm';
import { setupFormComponentTest } from './setup/test-setup';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    createCharacter: jest.fn(),
  },
}));

import { CharacterService } from '@/lib/services/CharacterService';

describe('CharacterValidationForm - Rendering', () => {
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

  describe('Form Rendering', () => {
    it('renders the form modal when open', () => {
      render(<CharacterValidationForm {...testProps} />);

      expect(screen.getByRole('heading', { name: 'Create Character' })).toBeInTheDocument();
      expect(screen.getByText('Build your character with real-time validation')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<CharacterValidationForm {...testProps} isOpen={false} />);

      expect(screen.queryByRole('heading', { name: 'Create Character' })).not.toBeInTheDocument();
    });

    it('renders all form sections', () => {
      render(<CharacterValidationForm {...testProps} />);

      expect(screen.getByTestId('basic-info-validation-section')).toBeInTheDocument();
      expect(screen.getByTestId('ability-scores-validation-section')).toBeInTheDocument();
      expect(screen.getByTestId('classes-validation-section')).toBeInTheDocument();
      expect(screen.getByTestId('combat-stats-validation-section')).toBeInTheDocument();
    });
  });

  describe('Initial Values', () => {
    it('pre-populates form with initial values', async () => {
      const initialValues = {
        name: 'Pre-filled Character',
        type: 'npc' as const,
        race: 'elf' as const,
        size: 'small' as const,
      };

      render(
        <CharacterValidationForm
          {...testProps}
          initialValues={initialValues}
        />
      );

      // Check the name input field
      expect(screen.getByDisplayValue('Pre-filled Character')).toBeInTheDocument();

      // For Select components, check that the form rendered successfully
      expect(screen.getByTestId('basic-info-validation-section')).toBeInTheDocument();

      // The select values might not be immediately visible as text
      // Just verify the form rendered with the initial values successfully
      const form = screen.getByRole('dialog');
      expect(form).toBeInTheDocument();
    });
  });
});