import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterVersionHistory } from '../CharacterVersionHistory';
import { CharacterService } from '@/lib/services/CharacterService';
import { renderWithProviders } from '@/lib/test-utils';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    getCharacterVersionHistory: jest.fn(),
    revertCharacterToVersion: jest.fn(),
  }
}));

const mockVersionHistory = [
  {
    id: 'version-1',
    timestamp: new Date('2023-10-01T10:00:00Z'),
    changes: {
      abilityScores: { strength: { from: 14, to: 16 } },
    },
    changeDescription: 'Increased strength from 14 to 16',
    userId: 'user-123'
  },
  {
    id: 'version-2',
    timestamp: new Date('2023-10-01T09:00:00Z'),
    changes: {
      backstory: { from: 'Old backstory', to: 'New backstory' }
    },
    changeDescription: 'Updated character backstory',
    userId: 'user-123'
  }
];

describe('CharacterVersionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CharacterService.getCharacterVersionHistory as jest.Mock).mockResolvedValue({
      success: true,
      data: mockVersionHistory
    });
  });

  it('should render version history component', async () => {
    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    // Wait for the component to finish loading
    await screen.findByTestId('version-history');
    expect(screen.getByTestId('version-history')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    expect(screen.getByTestId('version-history-loading')).toBeInTheDocument();
  });

  it('should load and display version history', async () => {
    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    await screen.findByText('Increased strength from 14 to 16');
    expect(screen.getByText('Updated character backstory')).toBeInTheDocument();
  });

  it('should display version timestamps', async () => {
    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    // Wait for content to load first
    await screen.findByText('Increased strength from 14 to 16');

    // Check for timestamps (they may be formatted differently based on locale)
    const timestamps = screen.getAllByText(/10\/1\/2023/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it('should allow reverting to a previous version', async () => {
    const user = userEvent.setup();
    (CharacterService.revertCharacterToVersion as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'char-123' }
    });

    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    await screen.findByText('Increased strength from 14 to 16');

    const revertButton = screen.getByTestId('revert-button-version-1');
    await user.click(revertButton);

    // Should show confirmation dialog
    expect(screen.getByTestId('revert-confirmation-dialog')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-revert-button');
    await user.click(confirmButton);

    expect(CharacterService.revertCharacterToVersion).toHaveBeenCalledWith(
      'char-123',
      'user-123',
      'version-1'
    );
  });

  it('should display detailed changes for each version', async () => {
    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    // Wait for content to load first, then check for changes
    await screen.findByText('Increased strength from 14 to 16');

    // The component formats changes, so look for the actual format
    expect(screen.getByText(/strength.*14.*16/)).toBeInTheDocument();
    expect(screen.getByText(/backstory.*Old backstory.*New backstory/)).toBeInTheDocument();
  });

  it('should handle error when loading version history fails', async () => {
    (CharacterService.getCharacterVersionHistory as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Failed to load version history' }
    });

    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    await screen.findByTestId('version-history-error');
    expect(screen.getByText('Failed to load version history')).toBeInTheDocument();
  });

  it('should display empty state when no version history exists', async () => {
    (CharacterService.getCharacterVersionHistory as jest.Mock).mockResolvedValue({
      success: true,
      data: []
    });

    renderWithProviders(
      <CharacterVersionHistory characterId="char-123" userId="user-123" />
    );

    await screen.findByTestId('version-history-empty');
    expect(screen.getByText('No version history available')).toBeInTheDocument();
  });
});