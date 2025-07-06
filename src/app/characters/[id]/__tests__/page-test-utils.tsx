import { render } from '@testing-library/react';
import { CharacterDetailClient } from '../CharacterDetailClient';

// Import all shared utilities from centralized location
import {
  setupUserEvent,
  createBasicTestCharacter,
  createCharacterWithStats,
  createCharacterWithAbilityScores,
  createMulticlassCharacter,
  createCharacterWithNotes,
  createCharacterWithBackstory,
  mockCharacterLoad,
  mockCharacterNotFound,
  mockCharacterLoadPending,
  waitForCharacterLoad,
  waitForText,
  waitForMultipleTexts,
  clickTabAndWait,
} from '@/components/characters/__tests__/character-test-base';

// Page-specific utilities
export const setupCharacterTest = () => {
  const user = setupUserEvent();
  return { user };
};

export const renderCharacterPage = (id = 'test-id') => {
  return render(<CharacterDetailClient id={id} />);
};

// Re-export centralized utilities with aliases for backwards compatibility
export {
  mockCharacterLoad,
  mockCharacterNotFound,
  mockCharacterLoadPending,
  waitForCharacterLoad,
  waitForText,
  waitForMultipleTexts,
  clickTabAndWait,
};

// Re-export character builders with page-specific aliases
export {
  createBasicTestCharacter as createBasicCharacter,
  createCharacterWithStats,
  createCharacterWithAbilityScores as createCharacterWithAbilities,
  createMulticlassCharacter,
  createCharacterWithNotes,
  createCharacterWithBackstory,
};

// Fetch mocking utilities to reduce duplication
export const mockSuccessfulCharacterFetch = (character: any, mockFetch: jest.MockedFunction<typeof fetch>) => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      success: true,
      data: character,
    }),
  } as Response);
};

export const mockFailedCharacterFetch = (error: string, mockFetch: jest.MockedFunction<typeof fetch>) => {
  mockFetch.mockResolvedValue({
    ok: false,
    json: async () => ({
      success: false,
      error,
    }),
  } as Response);
};

export const mockPendingCharacterFetch = (mockFetch: jest.MockedFunction<typeof fetch>) => {
  mockFetch.mockReturnValue(new Promise(() => {}));
};