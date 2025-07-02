import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterComparison } from '../CharacterComparison';
import { renderWithProviders } from '@/lib/test-utils';
import type { ICharacter } from '@/lib/models/Character';

const mockOriginalCharacter: Partial<ICharacter> = {
  name: 'Test Character',
  abilityScores: {
    strength: 14,
    dexterity: 16,
    constitution: 15,
    intelligence: 12,
    wisdom: 13,
    charisma: 10
  },
  backstory: 'Original backstory',
  notes: 'Original notes',
  hitPoints: { current: 47, maximum: 47, temporary: 0 },
  armorClass: 16
};

const mockUpdatedCharacter: Partial<ICharacter> = {
  name: 'Test Character Updated',
  abilityScores: {
    strength: 18,
    dexterity: 16,
    constitution: 15,
    intelligence: 12,
    wisdom: 13,
    charisma: 12
  },
  backstory: 'Updated backstory with more details',
  notes: 'Updated notes',
  hitPoints: { current: 50, maximum: 50, temporary: 0 },
  armorClass: 18
};

describe('CharacterComparison', () => {
  it('should render character comparison component', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    expect(screen.getByTestId('character-comparison')).toBeInTheDocument();
  });

  it('should display original and updated character names', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    expect(screen.getByTestId('original-name')).toHaveTextContent('Test Character');
    expect(screen.getByTestId('updated-name')).toHaveTextContent('Test Character Updated');
  });

  it('should highlight changed ability scores', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    // Strength changed from 14 to 18
    const strengthChange = screen.getByTestId('strength-change');
    expect(strengthChange).toBeInTheDocument();
    expect(strengthChange).toHaveTextContent('14');
    expect(strengthChange).toHaveTextContent('18');

    // Charisma changed from 10 to 12
    const charismaChange = screen.getByTestId('charisma-change');
    expect(charismaChange).toBeInTheDocument();
    expect(charismaChange).toHaveTextContent('10');
    expect(charismaChange).toHaveTextContent('12');

    // Dexterity unchanged - should not show change indicator
    expect(screen.queryByTestId('dexterity-change')).not.toBeInTheDocument();
  });

  it('should display backstory changes', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    expect(screen.getByTestId('backstory-change')).toBeInTheDocument();
    expect(screen.getByText('Original backstory')).toBeInTheDocument();
    expect(screen.getByText('Updated backstory with more details')).toBeInTheDocument();
  });

  it('should display derived stat changes', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    // HP changed from 47 to 50
    const hpChange = screen.getByTestId('hp-change');
    expect(hpChange).toBeInTheDocument();
    expect(hpChange).toHaveTextContent('47');
    expect(hpChange).toHaveTextContent('50');

    // AC changed from 16 to 18
    const acChange = screen.getByTestId('ac-change');
    expect(acChange).toBeInTheDocument();
    expect(acChange).toHaveTextContent('16');
    expect(acChange).toHaveTextContent('18');
  });

  it('should call onAcceptChanges when accept button is clicked', async () => {
    const user = userEvent.setup();
    const mockAcceptChanges = jest.fn();

    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={mockAcceptChanges}
        onRejectChanges={jest.fn()}
      />
    );

    const acceptButton = screen.getByTestId('accept-changes-button');
    await user.click(acceptButton);

    expect(mockAcceptChanges).toHaveBeenCalled();
  });

  it('should call onRejectChanges when reject button is clicked', async () => {
    const user = userEvent.setup();
    const mockRejectChanges = jest.fn();

    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={mockRejectChanges}
      />
    );

    const rejectButton = screen.getByTestId('reject-changes-button');
    await user.click(rejectButton);

    expect(mockRejectChanges).toHaveBeenCalled();
  });

  it('should display summary of total changes', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockUpdatedCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    expect(screen.getByTestId('changes-summary')).toBeInTheDocument();
    expect(screen.getByText(/7 changes detected/)).toBeInTheDocument();
  });

  it('should display no changes message when characters are identical', () => {
    renderWithProviders(
      <CharacterComparison
        originalCharacter={mockOriginalCharacter as ICharacter}
        updatedCharacter={mockOriginalCharacter as ICharacter}
        onAcceptChanges={jest.fn()}
        onRejectChanges={jest.fn()}
      />
    );

    expect(screen.getByTestId('no-changes-message')).toBeInTheDocument();
    expect(screen.getByText('No changes detected')).toBeInTheDocument();
  });
});