import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterService } from '@/lib/services/CharacterService';
import { createMockCharacter } from '@/lib/services/__tests__/CharacterService.test-helpers';
import { createCharacterWithSpells, createCharacterWithEquipment } from '@/app/characters/[id]/__tests__/test-helpers';

// Mock service type
const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

// Common test setup
export const setupUserEvent = () => userEvent.setup();

// Common character data builders
export const createBasicTestCharacter = (overrides = {}) =>
  createMockCharacter({
    name: 'Test Character',
    race: 'human',
    type: 'pc',
    level: 5,
    ...overrides,
  });

export const createCharacterWithStats = () =>
  createMockCharacter({
    hitPoints: { maximum: 45, current: 35, temporary: 0 },
    armorClass: 15,
    speed: 30,
  });

export const createCharacterWithAbilityScores = () =>
  createMockCharacter({
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
  createMockCharacter({
    classes: [
      { class: 'Fighter', level: 3, subclass: 'Battle Master', hitDie: 10 },
      { class: 'Rogue', level: 2, subclass: 'Arcane Trickster', hitDie: 8 },
    ],
  });

export const createCharacterWithNotes = () =>
  createMockCharacter({
    notes: 'This is a test character with some notes.',
  });

export const createCharacterWithBackstory = () =>
  createMockCharacter({
    backstory: 'Born in a small village, this character has a rich history.',
  });

// Common service mocking utilities
export const mockSuccessfulCharacterLoad = (character: any) => {
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

// Common interaction utilities
export const waitForCharacterToLoad = async (characterName = 'Test Character') => {
  await waitFor(() => {
    expect(screen.getByText(characterName)).toBeInTheDocument();
  });
};

export const clickTab = async (user: ReturnType<typeof userEvent.setup>, tabName: string) => {
  const tab = screen.getByRole('tab', { name: tabName });
  await user.click(tab);
};

export const expectTextToBeVisible = (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const expectTextsToBeVisible = (texts: string[]) => {
  texts.forEach(text => expectTextToBeVisible(text));
};

// Common test patterns
export const testTabNavigation = async (user: ReturnType<typeof userEvent.setup>, tabName: string, expectedTexts: string[]) => {
  await clickTab(user, tabName);
  await waitFor(() => {
    expectedTexts.forEach(text => expectTextToBeVisible(text));
  }, { timeout: 3000 });
};

// Re-export character builders for consistency
export { createCharacterWithSpells, createCharacterWithEquipment };