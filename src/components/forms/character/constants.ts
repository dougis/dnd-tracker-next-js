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

export const DEFAULT_CHARACTER_VALUES: CharacterCreation = {
  name: '',
  type: 'pc',
  race: 'human',
  customRace: '',
  size: 'medium',
  classes: [{ class: 'fighter', level: 1, hitDie: 10 }],
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  hitPoints: {
    maximum: 10,
    current: 10,
    temporary: 0,
  },
  armorClass: 10,
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
  skills: {},
  equipment: [],
  spells: [],
};