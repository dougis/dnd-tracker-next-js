import { z } from 'zod';
import {
  nameSchema,
  objectIdSchema,
  abilityScoreSchema,
  levelSchema,
  hitPointsSchema,
  armorClassSchema,
  initiativeSchema,
  dateSchema,
  createOptionalSchema,
  createArraySchema,
  type InferSchemaType,
} from './base';

/**
 * Character validation schemas for D&D 5e characters (PCs and NPCs)
 */

// D&D 5e classes
export const characterClassSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid character class' }),
  }
);

// D&D 5e races
export const characterRaceSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid character race' }),
  }
);

// Character type
export const characterTypeSchema = z.enum(['pc', 'npc'], {
  errorMap: () => ({ message: 'Character type must be either PC or NPC' }),
});

// Size categories
export const sizeSchema = z.enum(
  ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'],
  {
    errorMap: () => ({ message: 'Invalid size category' }),
  }
);

// Ability scores object
export const abilityScoresSchema = z.object({
  strength: abilityScoreSchema,
  dexterity: abilityScoreSchema,
  constitution: abilityScoreSchema,
  intelligence: abilityScoreSchema,
  wisdom: abilityScoreSchema,
  charisma: abilityScoreSchema,
});

// Character class with level (for multiclassing)
export const characterClassLevelSchema = z.object({
  class: characterClassSchema,
  level: levelSchema,
  hitDie: z.number().int().min(4).max(12),
  subclass: createOptionalSchema(z.string().min(1).max(50)),
});

// Equipment item
export const equipmentItemSchema = z.object({
  name: z.string().min(1, 'Equipment name is required').max(100),
  quantity: z.number().int().min(0).default(1),
  weight: createOptionalSchema(z.number().min(0)),
  value: createOptionalSchema(z.number().min(0)),
  description: createOptionalSchema(z.string().max(500)),
  equipped: z.boolean().default(false),
  magical: z.boolean().default(false),
});

// Spell
export const spellSchema = z.object({
  name: z.string().min(1, 'Spell name is required').max(100),
  level: z.number().int().min(0, 'Cantrips are level 0').max(9),
  school: z.enum([
    'abjuration',
    'conjuration',
    'divination',
    'enchantment',
    'evocation',
    'illusion',
    'necromancy',
    'transmutation',
  ]),
  castingTime: z.string().min(1).max(50),
  range: z.string().min(1).max(50),
  components: z.object({
    verbal: z.boolean().default(false),
    somatic: z.boolean().default(false),
    material: z.boolean().default(false),
    materialComponent: createOptionalSchema(z.string().max(200)),
  }),
  duration: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  prepared: z.boolean().default(false),
});

// Character creation schema
export const characterCreationSchema = z.object({
  name: nameSchema,
  type: characterTypeSchema,
  race: characterRaceSchema,
  customRace: z.string().max(50).optional(),
  size: sizeSchema.default('medium'),
  classes: createArraySchema(characterClassLevelSchema, 1, 3),
  abilityScores: abilityScoresSchema,
  hitPoints: z.object({
    maximum: hitPointsSchema,
    current: hitPointsSchema,
    temporary: z.number().int().min(0).default(0),
  }),
  armorClass: armorClassSchema,
  speed: z.number().int().min(0).max(120).default(30),
  proficiencyBonus: z.number().int().min(2).max(6),
  savingThrows: z.object({
    strength: z.boolean().default(false),
    dexterity: z.boolean().default(false),
    constitution: z.boolean().default(false),
    intelligence: z.boolean().default(false),
    wisdom: z.boolean().default(false),
    charisma: z.boolean().default(false),
  }),
  skills: z.record(z.string(), z.boolean()).default({}),
  equipment: createArraySchema(equipmentItemSchema, 0, 100).default([]),
  spells: createArraySchema(spellSchema, 0, 200).default([]),
  backstory: createOptionalSchema(z.string().max(2000)),
  notes: createOptionalSchema(z.string().max(1000)),
  imageUrl: createOptionalSchema(z.string().url()),
});

// Character update schema (allows partial updates)
export const characterUpdateSchema = characterCreationSchema.partial();

// Complete character schema (includes database fields)
export const characterSchema = characterCreationSchema.extend({
  _id: createOptionalSchema(objectIdSchema),
  ownerId: objectIdSchema,
  partyId: createOptionalSchema(objectIdSchema),
  isPublic: z.boolean().default(false),
  createdAt: dateSchema.default(() => new Date().toISOString()),
  updatedAt: dateSchema.default(() => new Date().toISOString()),
});

// Character summary schema (for lists and quick displays)
export const characterSummarySchema = z.object({
  _id: objectIdSchema,
  name: nameSchema,
  type: characterTypeSchema,
  race: characterRaceSchema,
  customRace: createOptionalSchema(z.string()),
  classes: createArraySchema(characterClassLevelSchema, 1, 3),
  level: z.number().int().min(1).max(20),
  hitPoints: z.object({
    maximum: hitPointsSchema,
    current: hitPointsSchema,
  }),
  armorClass: armorClassSchema,
  ownerId: objectIdSchema,
  partyId: createOptionalSchema(objectIdSchema),
  imageUrl: createOptionalSchema(z.string().url()),
});

// Character combat state schema
export const characterCombatSchema = z.object({
  characterId: objectIdSchema,
  encounterId: objectIdSchema,
  initiative: initiativeSchema,
  currentHitPoints: hitPointsSchema,
  temporaryHitPoints: z.number().int().min(0).default(0),
  conditions: createArraySchema(z.string(), 0, 20).default([]),
  concentration: createOptionalSchema(
    z.object({
      spellName: z.string(),
      spellLevel: z.number().int().min(0).max(9),
      duration: z.string(),
    })
  ),
  deathSaves: z
    .object({
      successes: z.number().int().min(0).max(3).default(0),
      failures: z.number().int().min(0).max(3).default(0),
    })
    .default({ successes: 0, failures: 0 }),
  isStable: z.boolean().default(true),
  turnOrder: z.number().int().min(0),
});

// API schemas
export const getCharacterByIdSchema = z.object({
  id: objectIdSchema,
});

export const getCharactersByOwnerSchema = z.object({
  ownerId: objectIdSchema,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const getCharactersByPartySchema = z.object({
  partyId: objectIdSchema,
});

// Quick character creation presets
export const characterPresetSchema = z.object({
  name: z.string().min(1).max(50),
  type: characterTypeSchema,
  race: characterRaceSchema,
  class: characterClassSchema,
  level: levelSchema,
  abilityScores: abilityScoresSchema,
  hitPoints: hitPointsSchema,
  armorClass: armorClassSchema,
});

// Character import/export schema
export const characterExportSchema = characterSchema.omit({
  _id: true,
  ownerId: true,
  partyId: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Character = InferSchemaType<typeof characterSchema>;
export type CharacterCreation = InferSchemaType<typeof characterCreationSchema>;
export type CharacterUpdate = InferSchemaType<typeof characterUpdateSchema>;
export type CharacterSummary = InferSchemaType<typeof characterSummarySchema>;
export type CharacterCombat = InferSchemaType<typeof characterCombatSchema>;
export type CharacterPreset = InferSchemaType<typeof characterPresetSchema>;
export type CharacterExport = InferSchemaType<typeof characterExportSchema>;
export type CharacterClass = InferSchemaType<typeof characterClassSchema>;
export type CharacterRace = InferSchemaType<typeof characterRaceSchema>;
export type CharacterType = InferSchemaType<typeof characterTypeSchema>;
export type AbilityScores = InferSchemaType<typeof abilityScoresSchema>;
export type CharacterClassLevel = InferSchemaType<
  typeof characterClassLevelSchema
>;
export type EquipmentItem = InferSchemaType<typeof equipmentItemSchema>;
export type Spell = InferSchemaType<typeof spellSchema>;
export type Size = InferSchemaType<typeof sizeSchema>;
