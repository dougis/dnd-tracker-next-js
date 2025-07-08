/**
 * Centralized export point for all test utilities
 * Provides single import for all shared test helpers
 */

// Test setup utilities
export * from './test-setup';

// Test assertion utilities
export * from './test-assertions';

// Test interaction utilities
export * from './test-interactions';

// Re-export existing test helpers for backward compatibility
export * from '../test-helpers';
export * from '../character-form.test-helpers';
export * from '../helpers/CharacterPreview.helpers';

// Commonly used test constants
export {
  DEFAULT_ABILITY_SCORES,
  DEFAULT_HIT_POINTS,
  DEFAULT_SAVING_THROWS,
  TEST_CHARACTER_DATA,
  createTestCharacter,
  createTestCharacterWithEnhancedAbilities,
  createMulticlassTestCharacter,
  createHighLevelTestCharacter,
  createInvalidTestCharacter
} from '../../constants';