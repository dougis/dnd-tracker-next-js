import { createCharacterWithSpells, createCharacterWithEquipment } from '@/app/characters/[id]/__tests__/test-helpers';

// Re-export all centralized utilities
export {
  setupUserEvent,
  createBasicTestCharacter,
  createCharacterWithStats,
  createCharacterWithAbilityScores,
  createMulticlassCharacter,
  createCharacterWithNotes,
  createCharacterWithBackstory,
  mockCharacterLoad as mockSuccessfulCharacterLoad,
  mockCharacterNotFound,
  mockCharacterLoadPending,
  waitForCharacterLoad as waitForCharacterToLoad,
  clickTab,
  expectTextToBeVisible,
  expectTextsToBeVisible,
  clickTabAndWait as testTabNavigation,
} from './character-test-base';

// Re-export character builders for consistency
export { createCharacterWithSpells, createCharacterWithEquipment };