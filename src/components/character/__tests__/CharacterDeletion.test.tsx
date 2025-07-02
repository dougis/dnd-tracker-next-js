import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterDeletionDialog } from '../CharacterDeletionDialog';
import { CharacterService } from '@/lib/services/CharacterService';
import { renderWithProviders } from '@/lib/test-utils';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    deleteCharacter: jest.fn(),
    deleteCharacterWithUndo: jest.fn(),
    restoreCharacter: jest.fn(),
  }
}));

const mockCharacter = {
  id: 'char-123',
  name: 'Test Character',
  userId: 'user-123'
};

describe('CharacterDeletionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render deletion confirmation dialog', () => {
    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(screen.getByTestId('character-deletion-dialog')).toBeInTheDocument();
    // Check for dialog title specifically (not button text)
    expect(screen.getByRole('heading', { name: /Delete Character/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Test Character"/)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={false}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(screen.queryByTestId('character-deletion-dialog')).not.toBeInTheDocument();
  });

  it('should require typing character name to confirm deletion', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    const deleteButton = screen.getByTestId('confirm-delete-button');
    expect(deleteButton).toBeDisabled();

    const confirmationInput = screen.getByTestId('character-name-confirmation');
    await user.type(confirmationInput, 'Test Character');

    expect(deleteButton).toBeEnabled();
  });

  it('should show warning about permanent deletion', () => {
    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(screen.getByTestId('deletion-warning')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();

    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={mockOnClose}
        onDeleted={jest.fn()}
      />
    );

    const cancelButton = screen.getByTestId('cancel-delete-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should delete character when confirmed', async () => {
    const user = userEvent.setup();
    const mockOnDeleted = jest.fn();

    (CharacterService.deleteCharacter as jest.Mock).mockResolvedValue({
      success: true
    });

    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={mockOnDeleted}
      />
    );

    const confirmationInput = screen.getByTestId('character-name-confirmation');
    await user.type(confirmationInput, 'Test Character');

    const deleteButton = screen.getByTestId('confirm-delete-button');
    await user.click(deleteButton);

    expect(CharacterService.deleteCharacter).toHaveBeenCalledWith('char-123', 'user-123');
    expect(mockOnDeleted).toHaveBeenCalled();
  });

  it('should display error message when deletion fails', async () => {
    const user = userEvent.setup();

    (CharacterService.deleteCharacter as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Failed to delete character' }
    });

    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    const confirmationInput = screen.getByTestId('character-name-confirmation');
    await user.type(confirmationInput, 'Test Character');

    const deleteButton = screen.getByTestId('confirm-delete-button');
    await user.click(deleteButton);

    await screen.findByTestId('deletion-error');
    expect(screen.getByText('Failed to delete character')).toBeInTheDocument();
  });

  it('should show loading state during deletion', async () => {
    const user = userEvent.setup();

    (CharacterService.deleteCharacter as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    const confirmationInput = screen.getByTestId('character-name-confirmation');
    await user.type(confirmationInput, 'Test Character');

    const deleteButton = screen.getByTestId('confirm-delete-button');
    await user.click(deleteButton);

    expect(screen.getByTestId('deletion-loading')).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });
});

describe('CharacterDeletionWithUndo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call deleteCharacterWithUndo when allowUndo is true', async () => {
    const user = userEvent.setup();

    const mockDelete = CharacterService.deleteCharacterWithUndo as jest.Mock;
    mockDelete.mockResolvedValue({
      success: true,
      data: { undoToken: 'undo-123', expiresAt: Date.now() + 30000 }
    });

    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
        allowUndo={true}
      />
    );

    const confirmationInput = screen.getByTestId('character-name-confirmation');
    await user.type(confirmationInput, 'Test Character');

    const deleteButton = screen.getByTestId('confirm-delete-button');
    await user.click(deleteButton);

    // Verify the correct delete method was called
    expect(mockDelete).toHaveBeenCalledWith('char-123', 'user-123');
    expect(CharacterService.deleteCharacter).not.toHaveBeenCalled();
  });

  it('should display undo warning when allowUndo is enabled', () => {
    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
        allowUndo={true}
      />
    );

    // Should show the undo-specific warning text
    expect(screen.getByText(/You will have 30 seconds to undo this action/)).toBeInTheDocument();
    expect(screen.queryByText(/This action cannot be undone/)).not.toBeInTheDocument();
  });

  it('should display permanent deletion warning when allowUndo is disabled', () => {
    renderWithProviders(
      <CharacterDeletionDialog
        character={mockCharacter}
        isOpen={true}
        onClose={jest.fn()}
        onDeleted={jest.fn()}
        allowUndo={false}
      />
    );

    // Should show the permanent deletion warning
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.queryByText(/You will have 30 seconds to undo this action/)).not.toBeInTheDocument();
  });

});