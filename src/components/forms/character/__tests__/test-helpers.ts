// Shared test utilities and data for character form tests

export const mockCharacterData = {
  name: 'Test Character',
  type: 'pc' as const,
  race: 'human' as const,
  size: 'medium' as const,
  abilityScores: {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 11,
    charisma: 10,
  },
  classes: [{ className: 'fighter' as const, level: 1 }],
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
  skills: [],
  equipment: [],
  spells: [],
  backstory: '',
  notes: '',
};

export const mockBasicInfoData = {
  name: 'Test Character',
  type: 'pc' as const,
  race: 'human',
  customRace: '',
};

export const mockAbilityScores = {
  strength: 15,
  dexterity: 14,
  constitution: 13,
  intelligence: 12,
  wisdom: 11,
  charisma: 10,
};

export const mockClassData = [
  { className: 'fighter', level: 1 },
];

export const mockCombatStats = {
  hitPoints: {
    maximum: 10,
    current: 10,
    temporary: 0,
  },
  armorClass: 16,
  speed: 30,
  proficiencyBonus: 2,
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

// Common test utilities
export const createMockProps = (overrides: any = {}) => ({
  ownerId: 'user123',
  onSuccess: jest.fn(),
  onError: jest.fn(),
  ...overrides,
});

export const createMockCharacterData = (overrides: any = {}) => ({
  ...mockCharacterData,
  ...overrides,
});

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

// Character data variants for testing
export const createInvalidCharacterData = {
  withEmptyName: () => createMockCharacterData({ name: '' }),
  withInvalidAbilityScore: () => createMockCharacterData({
    abilityScores: { ...mockAbilityScores, strength: 0 }
  }),
  withInvalidClass: () => createMockCharacterData({
    classes: [{ className: 'fighter', level: 0 }]
  }),
  withInvalidCombatStats: () => createMockCharacterData({
    hitPoints: { maximum: 0, current: 0 },
    armorClass: 0,
  }),
};

export const createValidCharacterData = {
  withCustomRace: () => createMockCharacterData({
    race: 'custom',
    customRace: 'Half-Dragon',
  }),
  withMulticlass: () => createMockCharacterData({
    classes: [
      { className: 'fighter', level: 3 },
      { className: 'rogue', level: 2 },
    ],
  }),
  withHighStats: () => createMockCharacterData({
    abilityScores: {
      strength: 20,
      dexterity: 18,
      constitution: 16,
      intelligence: 14,
      wisdom: 12,
      charisma: 10,
    },
  }),
};