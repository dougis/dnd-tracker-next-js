/**
 * Test helpers and data generators for character validation tests
 */

// Valid test data generators
export const createValidCharacterData = () => ({
  name: 'Thorin Oakenshield',
  type: 'pc' as const,
  race: 'dwarf' as const,
  size: 'medium' as const,
  classes: [
    {
      class: 'fighter' as const,
      level: 5,
      hitDie: 10,
      subclass: 'Champion',
    },
  ],
  abilityScores: {
    strength: 16,
    dexterity: 12,
    constitution: 15,
    intelligence: 10,
    wisdom: 13,
    charisma: 8,
  },
  hitPoints: {
    maximum: 42,
    current: 42,
    temporary: 0,
  },
  armorClass: 18,
  speed: 25,
  proficiencyBonus: 3,
  savingThrows: {
    strength: true,
    dexterity: false,
    constitution: true,
    intelligence: false,
    wisdom: false,
    charisma: false,
  },
  skills: {
    athletics: true,
    intimidation: true,
  },
  equipment: [
    {
      name: 'Plate Armor',
      quantity: 1,
      equipped: true,
    },
  ],
  spells: [],
  backstory: 'A proud dwarf warrior seeking to reclaim his homeland.',
  notes: 'Has a grudge against orcs.',
});

export const createValidCompleteCharacter = () => ({
  name: 'Database Character',
  type: 'pc' as const,
  race: 'elf' as const,
  classes: [
    {
      class: 'wizard' as const,
      level: 3,
      hitDie: 6,
      subclass: 'Evocation',
    },
  ],
  abilityScores: {
    strength: 8,
    dexterity: 16,
    constitution: 12,
    intelligence: 18,
    wisdom: 14,
    charisma: 10,
  },
  hitPoints: {
    maximum: 18,
    current: 18,
    temporary: 0,
  },
  armorClass: 13,
  proficiencyBonus: 2,
  savingThrows: {
    strength: false,
    dexterity: false,
    constitution: false,
    intelligence: true,
    wisdom: true,
    charisma: false,
  },
  ownerId: '507f1f77bcf86cd799439011',
  isPublic: false,
});

export const createValidSummary = () => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Summary Character',
  type: 'pc' as const,
  race: 'halfling' as const,
  classes: [
    {
      class: 'rogue' as const,
      level: 4,
      hitDie: 8,
      subclass: 'Thief',
    },
  ],
  level: 4,
  hitPoints: {
    maximum: 32,
    current: 20,
  },
  armorClass: 15,
  ownerId: '507f1f77bcf86cd799439012',
});

export const createValidCombatData = () => ({
  characterId: '507f1f77bcf86cd799439011',
  encounterId: '507f1f77bcf86cd799439012',
  initiative: 15,
  currentHitPoints: 25,
  temporaryHitPoints: 5,
  conditions: ['poisoned', 'grappled'],
  concentration: {
    spellName: 'Hold Person',
    spellLevel: 2,
    duration: '1 minute',
  },
  deathSaves: {
    successes: 1,
    failures: 0,
  },
  isStable: true,
  turnOrder: 3,
});

// Helper functions for generating test arrays
export const createTestSpell = (overrides = {}) => ({
  name: 'Test Spell',
  level: 1,
  school: 'evocation' as const,
  castingTime: '1 action',
  range: '30 feet',
  components: { verbal: true, somatic: false, material: false },
  duration: '1 minute',
  description: 'A test spell',
  ...overrides,
});

export const createTestEquipment = (overrides = {}) => ({
  name: 'Test Item',
  quantity: 1,
  ...overrides,
});

// Generate arrays with specified count
export const generateSpellArray = (count: number) => 
  Array.from({ length: count }, () => createTestSpell());

export const generateEquipmentArray = (count: number) => 
  Array.from({ length: count }, () => createTestEquipment());

// Common test data arrays
export const validCharacterClasses = [
  'artificer',
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
] as const;

export const validCharacterRaces = [
  'dragonborn',
  'dwarf',
  'elf',
  'gnome',
  'half-elf',
  'halfling',
  'half-orc',
  'human',
  'tiefling',
  'aarakocra',
  'genasi',
  'goliath',
  'aasimar',
  'bugbear',
  'firbolg',
  'goblin',
  'hobgoblin',
  'kenku',
  'kobold',
  'lizardfolk',
  'orc',
  'tabaxi',
  'triton',
  'yuan-ti',
  'custom',
] as const;

export const validSizes = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan',
] as const;

export const validSpellSchools = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
] as const;

// Helper function for character export test data
export const createCharacterWithDbFields = () => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Export Character',
  type: 'pc' as const,
  race: 'dwarf' as const,
  classes: [
    {
      class: 'cleric' as const,
      level: 3,
      hitDie: 8,
      subclass: 'Life',
    },
  ],
  abilityScores: {
    strength: 14,
    dexterity: 10,
    constitution: 15,
    intelligence: 12,
    wisdom: 16,
    charisma: 13,
  },
  hitPoints: {
    maximum: 24,
    current: 24,
    temporary: 0,
  },
  armorClass: 16,
  proficiencyBonus: 2,
  savingThrows: {
    strength: false,
    dexterity: false,
    constitution: false,
    intelligence: false,
    wisdom: true,
    charisma: true,
  },
  ownerId: '507f1f77bcf86cd799439012',
  partyId: '507f1f77bcf86cd799439013',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-02T00:00:00.000Z',
});