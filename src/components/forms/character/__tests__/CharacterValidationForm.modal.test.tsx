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

describe('CharacterValidationForm - Modal Behavior', () => {
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

  describe('Modal Behavior', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      render(<CharacterValidationForm {...testProps} />);

      await userEvent.click(screen.getByText('Cancel'));

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when modal is closed', async () => {
      render(<CharacterValidationForm {...testProps} />);

      // Find the modal's close button (usually an X button) or press Escape
      // The Modal should call onOpenChange with false when closed
      const user = userEvent.setup();
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(defaultProps.onCancel).toHaveBeenCalled();
      });
    });
  });
});