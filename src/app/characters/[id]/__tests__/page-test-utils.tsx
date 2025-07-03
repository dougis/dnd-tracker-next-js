import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterDetailClient } from '../CharacterDetailClient';
import { CharacterService } from '@/lib/services/CharacterService';
import { createMockCharacter } from '@/lib/services/__tests__/CharacterService.test-helpers';

const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

// Common test setup
export const setupCharacterTest = () => {
  const user = userEvent.setup();
  return { user };
};

// Common character loading setup
export const mockCharacterLoad = (character: any) => {
  mockCharacterService.getCharacterById.mockResolvedValue({
    success: true,
    data: character,
  });
};

export const mockCharacterNotFound = () => {
  mockCharacterService.getCharacterById.mockResolvedValue({
    success: false,
    error: { message: 'Character not found', code: 'NOT_FOUND' },
  });
};

export const mockCharacterLoadPending = () => {
  mockCharacterService.getCharacterById.mockReturnValue(new Promise(() => {}));
};

// Common rendering patterns
export const renderCharacterPage = (id = 'test-id') => {
  return render(<CharacterDetailClient id={id} />);
};

// Common wait patterns
export const waitForCharacterLoad = async (characterName = 'Test Character') => {
  await waitFor(() => {
    expect(screen.getByText(characterName)).toBeInTheDocument();
  });
};

export const waitForText = async (text: string, timeout = 3000) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  }, { timeout });
};

export const waitForMultipleTexts = async (texts: string[], timeout = 3000) => {
  await waitFor(() => {
    texts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  }, { timeout });
};

// Common tab navigation
export const clickTabAndWait = async (user: ReturnType<typeof userEvent.setup>, tabName: string, expectedTexts: string[]) => {
  const tab = screen.getByRole('tab', { name: tabName });
  await user.click(tab);
  await waitForMultipleTexts(expectedTexts);
};

// Common character builders
export const createBasicCharacter = (overrides = {}) =>
  createMockCharacter({
    name: 'Test Character',
    race: 'human',
    type: 'pc',
    level: 5,
    ...overrides,
  });

export const createCharacterWithStats = () =>
  createBasicCharacter({
    hitPoints: { maximum: 45, current: 35, temporary: 0 },
    armorClass: 15,
    speed: 30,
  });

export const createCharacterWithAbilities = () =>
  createBasicCharacter({
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    },
  });

export const createMulticlassCharacter = () =>
  createBasicCharacter({
    classes: [
      { class: 'Fighter', level: 3, subclass: 'Battle Master', hitDie: 10 },
      { class: 'Rogue', level: 2, subclass: 'Arcane Trickster', hitDie: 8 },
    ],
  });

export const createCharacterWithNotes = () =>
  createBasicCharacter({
    notes: 'This is a test character with some notes.',
  });

export const createCharacterWithBackstory = () =>
  createBasicCharacter({
    backstory: 'Born in a small village, this character has a rich history.',
  });