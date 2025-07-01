import { CharacterClass, CharacterRace, CharacterType } from '@/lib/validations/character';

export interface TestCharacterData {
  name: string;
  type: CharacterType;
  race: CharacterRace | 'custom';
  customRace?: string;
  classes: Array<{
    className: CharacterClass;
    level: number;
  }>;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    maximum: number;
    current: number;
    temporary?: number;
  };
  armorClass: number;
  speed?: number;
  proficiencyBonus?: number;
  backstory?: string;
  notes?: string;
}

export const createValidTestCharacter = (overrides: Partial<TestCharacterData> = {}): TestCharacterData => ({
  name: 'Test Character',
  type: 'pc',
  race: 'human',
  classes: [{ className: 'fighter', level: 1 }],
  abilityScores: {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 11,
    charisma: 10,
  },
  hitPoints: {
    maximum: 10,
    current: 10,
  },
  armorClass: 14,
  speed: 30,
  proficiencyBonus: 2,
  ...overrides,
});

export const createMulticlassTestCharacter = (): TestCharacterData => createValidTestCharacter({
  name: 'Multiclass Hero',
  classes: [
    { className: 'fighter', level: 3 },
    { className: 'rogue', level: 2 },
  ],
  hitPoints: {
    maximum: 35,
    current: 35,
  },
});

export const createCustomRaceTestCharacter = (): TestCharacterData => createValidTestCharacter({
  name: 'Custom Race Character',
  race: 'custom',
  customRace: 'Dragonborn Variant',
});

export const createNPCTestCharacter = (): TestCharacterData => createValidTestCharacter({
  name: 'Goblin Warrior',
  type: 'npc',
  race: 'goblin',
  classes: [{ className: 'barbarian', level: 2 }],
  abilityScores: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 8,
    wisdom: 10,
    charisma: 8,
  },
  hitPoints: {
    maximum: 18,
    current: 18,
  },
  armorClass: 13,
});

export const createHighLevelTestCharacter = (): TestCharacterData => createValidTestCharacter({
  name: 'Epic Hero',
  classes: [
    { className: 'paladin', level: 10 },
    { className: 'sorcerer', level: 10 },
  ],
  abilityScores: {
    strength: 20,
    dexterity: 14,
    constitution: 16,
    intelligence: 12,
    wisdom: 13,
    charisma: 18,
  },
  hitPoints: {
    maximum: 150,
    current: 150,
  },
  armorClass: 18,
  proficiencyBonus: 4,
});

export const createInvalidTestCharacter = (): Partial<TestCharacterData> => ({
  name: '', // Invalid: empty name
  type: 'pc',
  race: 'human',
  classes: [{ className: 'fighter', level: 0 }], // Invalid: level 0
  abilityScores: {
    strength: 31, // Invalid: over max
    dexterity: 0, // Invalid: under min
    constitution: 13,
    intelligence: 12,
    wisdom: 11,
    charisma: 10,
  },
  hitPoints: {
    maximum: -5, // Invalid: negative HP
    current: 10,
  },
  armorClass: 0, // Invalid: AC 0
});

export interface FormTestHelpers {
  fillBasicInfo: (character: TestCharacterData) => Promise<void>;
  fillAbilityScores: (scores: TestCharacterData['abilityScores']) => Promise<void>;
  fillClasses: (classes: TestCharacterData['classes']) => Promise<void>;
  fillCombatStats: (hitPoints: TestCharacterData['hitPoints'], armorClass: number) => Promise<void>;
  submitForm: () => Promise<void>;
  expectValidationError: (fieldName: string, errorMessage: string) => void;
}

export const createFormTestHelpers = (
  screen: any,
  userEvent: any
): FormTestHelpers => ({
  async fillBasicInfo(character: TestCharacterData) {
    const nameField = screen.getByLabelText(/character name/i);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, character.name);

    const typeField = screen.getByLabelText(/character type/i);
    await userEvent.selectOptions(typeField, character.type);

    const raceField = screen.getByLabelText(/race/i);
    await userEvent.click(raceField);
    if (character.race === 'custom' && character.customRace) {
      await userEvent.click(screen.getByText('Custom'));
      const customRaceField = screen.getByLabelText(/custom race name/i);
      await userEvent.type(customRaceField, character.customRace);
    } else {
      const raceOption = screen.getByText(new RegExp(character.race as string, 'i'));
      await userEvent.click(raceOption);
    }
  },

  async fillAbilityScores(scores: TestCharacterData['abilityScores']) {
    const abilities = [
      { name: 'Strength', value: scores.strength },
      { name: 'Dexterity', value: scores.dexterity },
      { name: 'Constitution', value: scores.constitution },
      { name: 'Intelligence', value: scores.intelligence },
      { name: 'Wisdom', value: scores.wisdom },
      { name: 'Charisma', value: scores.charisma },
    ];

    for (const ability of abilities) {
      const field = screen.getByLabelText(new RegExp(ability.name, 'i'));
      await userEvent.clear(field);
      await userEvent.type(field, ability.value.toString());
    }
  },

  async fillClasses(classes: TestCharacterData['classes']) {
    // Fill first class (always present)
    if (classes.length > 0) {
      const classField = screen.getAllByLabelText(/character class/i)[0];
      await userEvent.click(classField);
      await userEvent.click(screen.getByText(new RegExp(classes[0].className, 'i')));

      const levelField = screen.getAllByLabelText(/level/i)[0];
      await userEvent.clear(levelField);
      await userEvent.type(levelField, classes[0].level.toString());
    }

    // Add additional classes
    for (let i = 1; i < classes.length; i++) {
      const addClassButton = screen.getByRole('button', { name: /add class/i });
      await userEvent.click(addClassButton);

      const classField = screen.getAllByLabelText(/character class/i)[i];
      await userEvent.click(classField);
      await userEvent.click(screen.getByText(new RegExp(classes[i].className, 'i')));

      const levelField = screen.getAllByLabelText(/level/i)[i];
      await userEvent.clear(levelField);
      await userEvent.type(levelField, classes[i].level.toString());
    }
  },

  async fillCombatStats(hitPoints: TestCharacterData['hitPoints'], armorClass: number) {
    const maxHpField = screen.getByLabelText(/maximum hit points/i);
    await userEvent.clear(maxHpField);
    await userEvent.type(maxHpField, hitPoints.maximum.toString());

    const currentHpField = screen.getByLabelText(/current hit points/i);
    await userEvent.clear(currentHpField);
    await userEvent.type(currentHpField, hitPoints.current.toString());

    if (hitPoints.temporary) {
      const tempHpField = screen.getByLabelText(/temporary hit points/i);
      await userEvent.clear(tempHpField);
      await userEvent.type(tempHpField, hitPoints.temporary.toString());
    }

    const acField = screen.getByLabelText(/armor class/i);
    await userEvent.clear(acField);
    await userEvent.type(acField, armorClass.toString());
  },

  async submitForm() {
    const submitButton = screen.getByRole('button', { name: /create character/i });
    await userEvent.click(submitButton);
  },

  expectValidationError(fieldName: string, errorMessage: string) {
    const errorElement = screen.getByText(new RegExp(errorMessage, 'i'));
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('role', 'alert');
  },
});

export const mockCharacterServiceResponses = {
  success: (characterData: any) => ({
    success: true,
    data: {
      id: 'char123',
      ...characterData,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }),

  validationError: (message: string, details?: string) => ({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  }),

  permissionError: (message: string) => ({
    success: false,
    error: {
      code: 'PERMISSION_DENIED',
      message,
    },
  }),

  databaseError: (message: string) => ({
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message,
    },
  }),
};

export const expectFormToBeInLoadingState = (screen: any) => {
  expect(screen.getByText(/creating character/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create character/i })).toBeDisabled();
};

export const expectFormToShowError = (screen: any, errorMessage: string) => {
  expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
};

export const expectCharacterPreviewToShow = (screen: any, character: TestCharacterData) => {
  expect(screen.getByText('Character Preview')).toBeInTheDocument();
  expect(screen.getByText(character.name)).toBeInTheDocument();
  expect(screen.getByText(new RegExp(character.race as string, 'i'))).toBeInTheDocument();

  // Check ability scores in preview
  Object.entries(character.abilityScores).forEach(([ability, score]) => {
    expect(screen.getByText(score.toString())).toBeInTheDocument();
  });
};