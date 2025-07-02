import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterDeletionDialog } from '../CharacterDeletionDialog';
import { CharacterService } from '@/lib/services/CharacterService';
import { renderWithProviders } from '@/lib/test-utils';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    deleteCharacter: jest.fn(),
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
    expect(screen.getByText('Delete Character')).toBeInTheDocument();
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
  it('should show undo notification after successful deletion', async () => {
    const user = userEvent.setup();

    (CharacterService.deleteCharacter as jest.Mock).mockResolvedValue({
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

    await screen.findByTestId('undo-notification');
    expect(screen.getByText('Character deleted successfully')).toBeInTheDocument();
    expect(screen.getByTestId('undo-delete-button')).toBeInTheDocument();
  });

  it('should restore character when undo is clicked', async () => {
    const user = userEvent.setup();

    (CharacterService.deleteCharacter as jest.Mock).mockResolvedValue({
      success: true,
      data: { undoToken: 'undo-123', expiresAt: Date.now() + 30000 }
    });

    (CharacterService.restoreCharacter as jest.Mock).mockResolvedValue({
      success: true,
      data: mockCharacter
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

    const undoButton = await screen.findByTestId('undo-delete-button');
    await user.click(undoButton);

    expect(CharacterService.restoreCharacter).toHaveBeenCalledWith('undo-123');
    await screen.findByText('Character restored successfully');
  });

  it('should show countdown timer for undo window', async () => {
    const user = userEvent.setup();

    (CharacterService.deleteCharacter as jest.Mock).mockResolvedValue({
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

    await screen.findByTestId('undo-countdown');
    expect(screen.getByText(/Undo available for \d+ seconds/)).toBeInTheDocument();
  });
});