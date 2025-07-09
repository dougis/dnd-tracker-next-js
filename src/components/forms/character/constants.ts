// Shared constants for character forms

import { CharacterCreation } from '@/lib/validations/character';

export const CHARACTER_TYPE_OPTIONS = [
  { value: 'pc', label: 'Player Character' },
  { value: 'npc', label: 'Non-Player Character' },
] as const;

export const CHARACTER_RACE_OPTIONS = [
  { value: 'human', label: 'Human' },
  { value: 'elf', label: 'Elf' },
  { value: 'dwarf', label: 'Dwarf' },
  { value: 'halfling', label: 'Halfling' },
  { value: 'dragonborn', label: 'Dragonborn' },
  { value: 'gnome', label: 'Gnome' },
  { value: 'half-elf', label: 'Half-Elf' },
  { value: 'half-orc', label: 'Half-Orc' },
  { value: 'tiefling', label: 'Tiefling' },
  { value: 'aasimar', label: 'Aasimar' },
  { value: 'firbolg', label: 'Firbolg' },
  { value: 'goliath', label: 'Goliath' },
  { value: 'kenku', label: 'Kenku' },
  { value: 'lizardfolk', label: 'Lizardfolk' },
  { value: 'tabaxi', label: 'Tabaxi' },
  { value: 'triton', label: 'Triton' },
  { value: 'yuan-ti', label: 'Yuan-Ti Pureblood' },
  { value: 'goblin', label: 'Goblin' },
  { value: 'hobgoblin', label: 'Hobgoblin' },
  { value: 'orc', label: 'Orc' },
  { value: 'custom', label: 'Custom' },
] as const;

export const SIZE_OPTIONS = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'huge', label: 'Huge' },
  { value: 'gargantuan', label: 'Gargantuan' },
] as const;

export const CHARACTER_CLASS_OPTIONS = [
  { value: 'artificer', label: 'Artificer' },
  { value: 'barbarian', label: 'Barbarian' },
  { value: 'bard', label: 'Bard' },
  { value: 'cleric', label: 'Cleric' },
  { value: 'druid', label: 'Druid' },
  { value: 'fighter', label: 'Fighter' },
  { value: 'monk', label: 'Monk' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'ranger', label: 'Ranger' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'sorcerer', label: 'Sorcerer' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'wizard', label: 'Wizard' },
];

export const ABILITY_SCORES = [
  { key: 'strength', label: 'Strength', abbr: 'STR' },
  { key: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
  { key: 'constitution', label: 'Constitution', abbr: 'CON' },
  { key: 'intelligence', label: 'Intelligence', abbr: 'INT' },
  { key: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
  { key: 'charisma', label: 'Charisma', abbr: 'CHA' },
] as const;

// Default data structures for reuse
export const DEFAULT_ABILITY_SCORES = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

export const DEFAULT_SAVING_THROWS = {
  strength: false,
  dexterity: false,
  constitution: false,
  intelligence: false,
  wisdom: false,
  charisma: false,
};

export const DEFAULT_HIT_POINTS = {
  maximum: 10,
  current: 10,
  temporary: 0,
};

export const DEFAULT_CHARACTER_VALUES: CharacterCreation = {
  name: '',
  type: 'pc',
  race: 'human',
  customRace: '',
  size: 'medium',
  classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
  abilityScores: DEFAULT_ABILITY_SCORES,
  hitPoints: DEFAULT_HIT_POINTS,
  armorClass: 10,
  speed: 30,
  proficiencyBonus: 2,
  savingThrows: DEFAULT_SAVING_THROWS,
  skills: {},
  equipment: [],
  spells: [],
};

// Unified test data factories to reduce duplication across test files
export const TEST_CHARACTER_DATA = {
  // Basic character data for testing
  basic: {
    name: 'Test Character',
    type: 'pc' as const,
    race: 'human' as const,
    customRace: '',
    size: 'medium' as const,
    abilityScores: DEFAULT_ABILITY_SCORES,
    classes: [{ className: 'fighter' as const, level: 1 }],
    hitPoints: DEFAULT_HIT_POINTS,
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 2,
    savingThrows: DEFAULT_SAVING_THROWS,
    skills: [],
    equipment: [],
    spells: [],
    backstory: '',
    notes: '',
  },

  // Enhanced ability scores for testing
  enhancedAbilities: {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 11,
    charisma: 10,
  },

  // Multiclass character data
  multiclass: {
    classes: [
      { className: 'fighter' as const, level: 3 },
      { className: 'rogue' as const, level: 2 },
    ],
  },

  // High-level character data
  highLevel: {
    name: 'Epic Hero',
    classes: [
      { className: 'paladin' as const, level: 10 },
      { className: 'sorcerer' as const, level: 10 },
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
      temporary: 0,
    },
    armorClass: 18,
    proficiencyBonus: 4,
  },

  // Invalid data for testing validation
  invalid: {
    name: '', // Invalid: empty name
    type: 'pc' as const,
    race: 'human' as const,
    classes: [{ className: 'fighter' as const, level: 0 }], // Invalid: level 0
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
      temporary: 0,
    },
    armorClass: 0, // Invalid: AC 0
  },
} as const;

// Factory functions to create test data with overrides
export const createTestCharacter = (overrides: any = {}) => ({
  ...TEST_CHARACTER_DATA.basic,
  ...overrides,
});

export const createTestCharacterWithEnhancedAbilities = (overrides: any = {}) => ({
  ...TEST_CHARACTER_DATA.basic,
  abilityScores: TEST_CHARACTER_DATA.enhancedAbilities,
  ...overrides,
});

export const createMulticlassTestCharacter = (overrides: any = {}) => ({
  ...TEST_CHARACTER_DATA.basic,
  ...TEST_CHARACTER_DATA.multiclass,
  name: 'Multiclass Hero',
  hitPoints: {
    maximum: 35,
    current: 35,
    temporary: 0,
  },
  ...overrides,
});

export const createHighLevelTestCharacter = (overrides: any = {}) => ({
  ...TEST_CHARACTER_DATA.basic,
  ...TEST_CHARACTER_DATA.highLevel,
  ...overrides,
});

export const createInvalidTestCharacter = (overrides: any = {}) => ({
  ...TEST_CHARACTER_DATA.basic,
  ...TEST_CHARACTER_DATA.invalid,
  ...overrides,
});