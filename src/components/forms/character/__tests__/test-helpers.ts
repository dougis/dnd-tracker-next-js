// Shared test utilities and data for character form tests
import { 
  createTestCharacterWithEnhancedAbilities,
  TEST_CHARACTER_DATA,
  DEFAULT_HIT_POINTS,
  createTestCharacter,
  createMulticlassTestCharacter,
  createHighLevelTestCharacter,
  createInvalidTestCharacter
} from '../constants';

// Use consolidated test data from constants
export const mockCharacterData = createTestCharacterWithEnhancedAbilities();

export const mockBasicInfoData = {
  name: mockCharacterData.name,
  type: mockCharacterData.type,
  race: mockCharacterData.race,
  customRace: mockCharacterData.customRace || '',
};

export const mockAbilityScores = TEST_CHARACTER_DATA.enhancedAbilities;

export const mockClassData = mockCharacterData.classes;

export const mockCombatStats = {
  hitPoints: DEFAULT_HIT_POINTS,
  armorClass: mockCharacterData.armorClass,
  speed: mockCharacterData.speed,
  proficiencyBonus: mockCharacterData.proficiencyBonus,
};

export const mockFormData = {
  basicInfo: mockBasicInfoData,
  abilityScores: mockAbilityScores,
  classes: mockClassData,
  combatStats: mockCombatStats,
};

export const mockValidCharacterPreviewProps = {
  basicInfo: mockBasicInfoData,
  abilityScores: mockAbilityScores,
  classes: mockClassData,
  combatStats: mockCombatStats,
  isValid: true,
};

// Service mock results
export const mockSuccessResult = {
  success: true as const,
  data: {
    _id: 'char123',
    ownerId: 'user123',
    name: 'Test Character',
    type: 'pc' as const,
    race: 'human',
    size: 'medium' as const,
    classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 11,
      charisma: 10,
    },
    hitPoints: { maximum: 10, current: 10, temporary: 0 },
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 2,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    skills: new Map(),
    equipment: [],
    spells: [],
    backstory: '',
    notes: '',
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const mockErrorResult = {
  success: false as const,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Character validation failed',
    details: { field: 'name', message: 'Name is required' },
  },
};

// Character data variants now use consolidated factories

// Common test utilities
export const createMockProps = (overrides: any = {}) => ({
  ownerId: 'user123',
  onSuccess: jest.fn(),
  onError: jest.fn(),
  ...overrides,
});

export const createMockCharacterData = (overrides: any = {}) => createTestCharacter(overrides);

export const createMockFormData = (overrides: any = {}) => ({
  ...mockFormData,
  ...overrides,
});

// Test assertion helpers
export const expectFunctionToBeDefined = (fn: any, _name: string) => {
  expect(typeof fn).toBe('function');
  expect(fn).toBeDefined();
};

export const expectInitialFormState = (result: any) => {
  expect(result.current.isSubmitting).toBe(false);
  expect(result.current.submitError).toBe(null);
  expectFunctionToBeDefined(result.current.submitCharacter, 'submitCharacter');
  expectFunctionToBeDefined(result.current.clearError, 'clearError');
};

// Component testing helpers
export const getFieldByLabel = (getByLabelText: any, label: string | RegExp) => {
  return getByLabelText(label);
};

export const expectFieldToBeRequired = (field: any) => {
  expect(field).toHaveAttribute('aria-required', 'true');
};

export const expectFieldToHaveError = (field: any, errorMessage: string, getByText: any) => {
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(getByText(errorMessage)).toBeInTheDocument();
};

// Character data variants for testing - use consolidated factories
export const createInvalidCharacterData = {
  withEmptyName: () => createInvalidTestCharacter({ name: '' }),
  withInvalidAbilityScore: () => createInvalidTestCharacter({
    abilityScores: { ...mockAbilityScores, strength: 0 }
  }),
  withInvalidClass: () => createInvalidTestCharacter({
    classes: [{ className: 'fighter', level: 0 }]
  }),
  withInvalidCombatStats: () => createInvalidTestCharacter({
    hitPoints: { maximum: 0, current: 0 },
    armorClass: 0,
  }),
};

export const createValidCharacterData = {
  withCustomRace: () => createTestCharacter({
    race: 'custom',
    customRace: 'Half-Dragon',
  }),
  withMulticlass: () => createMulticlassTestCharacter(),
  withHighStats: () => createHighLevelTestCharacter(),
};