import { z } from 'zod';
import {
  objectIdSchema,
  dateSchema,
  createOptionalSchema,
  createArraySchema,
  levelSchema,
  hitPointsSchema,
  armorClassSchema,
  initiativeSchema,
  challengeRatingSchema,
  abilityScoreSchema,
  type InferSchemaType,
} from './base';

/**
 * Encounter validation schemas for D&D combat encounter management
 */

// Encounter status validation
export const encounterStatusSchema = z.enum(
  ['draft', 'active', 'completed', 'archived'],
  {
    errorMap: () => ({ message: 'Invalid encounter status' }),
  }
);

// Encounter difficulty validation
export const encounterDifficultySchema = z.enum(
  ['trivial', 'easy', 'medium', 'hard', 'deadly'],
  {
    errorMap: () => ({ message: 'Invalid encounter difficulty' }),
  }
);

// Participant type validation
export const participantTypeSchema = z.enum(['pc', 'npc', 'monster'], {
  errorMap: () => ({ message: 'Invalid participant type' }),
});

// Initiative entry schema for tracking turn order
export const initiativeEntrySchema = z.object({
  participantId: objectIdSchema,
  initiative: initiativeSchema,
  dexterity: abilityScoreSchema,
  isActive: z.boolean().default(false),
  hasActed: z.boolean().default(false),
});

// Participant reference schema for encounter participants
export const participantReferenceSchema = z.object({
  characterId: objectIdSchema,
  name: z
    .string()
    .min(1, 'Participant name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  type: participantTypeSchema,
  maxHitPoints: hitPointsSchema.min(1, 'Maximum hit points must be at least 1'),
  currentHitPoints: hitPointsSchema,
  temporaryHitPoints: hitPointsSchema.default(0),
  armorClass: armorClassSchema,
  initiative: createOptionalSchema(initiativeSchema),
  isPlayer: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').default(''),
  conditions: createArraySchema(
    z
      .string()
      .min(1, 'Condition name is required')
      .max(50, 'Condition name cannot exceed 50 characters'),
    0,
    20
  ).default([]),
  position: createOptionalSchema(
    z.object({
      x: z.number().min(0, 'X position cannot be negative'),
      y: z.number().min(0, 'Y position cannot be negative'),
    })
  ),
});

// Encounter settings schema for combat configuration
export const encounterSettingsSchema = z.object({
  allowPlayerVisibility: z.boolean().default(true),
  autoRollInitiative: z.boolean().default(false),
  trackResources: z.boolean().default(true),
  enableLairActions: z.boolean().default(false),
  lairActionInitiative: createOptionalSchema(initiativeSchema),
  enableGridMovement: z.boolean().default(false),
  gridSize: z
    .number()
    .min(1, 'Grid size must be at least 1')
    .max(50, 'Grid size cannot exceed 50')
    .default(5),
  roundTimeLimit: createOptionalSchema(
    z
      .number()
      .min(30, 'Round time limit must be at least 30 seconds')
      .max(600, 'Round time limit cannot exceed 10 minutes')
  ),
  experienceThreshold: createOptionalSchema(challengeRatingSchema),
});

// Combat state schema for active encounter tracking
export const combatStateSchema = z.object({
  isActive: z.boolean().default(false),
  currentRound: z
    .number()
    .int('Round must be a whole number')
    .min(0, 'Round cannot be negative')
    .default(0),
  currentTurn: z
    .number()
    .int('Turn must be a whole number')
    .min(0, 'Turn cannot be negative')
    .default(0),
  initiativeOrder: createArraySchema(initiativeEntrySchema, 0, 50).default([]),
  startedAt: createOptionalSchema(dateSchema),
  pausedAt: createOptionalSchema(dateSchema),
  endedAt: createOptionalSchema(dateSchema),
  totalDuration: z.number().min(0, 'Duration cannot be negative').default(0),
});

// Base encounter schema for database operations
export const encounterSchema = z.object({
  _id: createOptionalSchema(objectIdSchema),
  ownerId: objectIdSchema,
  name: z
    .string()
    .min(1, 'Encounter name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .default(''),
  tags: createArraySchema(
    z
      .string()
      .min(1, 'Tag cannot be empty')
      .max(30, 'Tag cannot exceed 30 characters'),
    0,
    10
  ).default([]),
  difficulty: createOptionalSchema(encounterDifficultySchema),
  estimatedDuration: createOptionalSchema(
    z
      .number()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours')
  ),
  targetLevel: createOptionalSchema(levelSchema),
  participants: createArraySchema(participantReferenceSchema, 0, 50).default(
    []
  ),
  settings: encounterSettingsSchema.default({}),
  combatState: combatStateSchema.default({}),
  status: encounterStatusSchema.default('draft'),
  partyId: createOptionalSchema(objectIdSchema),
  isPublic: z.boolean().default(false),
  sharedWith: createArraySchema(objectIdSchema, 0, 20).default([]),
  version: z
    .number()
    .int('Version must be a whole number')
    .min(1, 'Version must be at least 1')
    .default(1),
  createdAt: dateSchema.default(() => new Date().toISOString()),
  updatedAt: dateSchema.default(() => new Date().toISOString()),
});

// Encounter creation schema (for new encounters)
export const createEncounterSchema = encounterSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    version: true,
    combatState: true,
  })
  .extend({
    participants: createArraySchema(participantReferenceSchema, 1, 50),
  });

// Encounter update schema (for editing encounters)
export const updateEncounterSchema = encounterSchema.partial().omit({
  _id: true,
  ownerId: true,
  createdAt: true,
});

// Encounter summary schema (for listing views)
export const encounterSummarySchema = encounterSchema
  .pick({
    _id: true,
    name: true,
    description: true,
    tags: true,
    difficulty: true,
    estimatedDuration: true,
    targetLevel: true,
    status: true,
    isPublic: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    participantCount: z
      .number()
      .int('Participant count must be a whole number')
      .min(0, 'Participant count cannot be negative'),
    playerCount: z
      .number()
      .int('Player count must be a whole number')
      .min(0, 'Player count cannot be negative'),
    isActive: z.boolean(),
  });

// Combat action schemas
export const startCombatSchema = z.object({
  encounterId: objectIdSchema,
  autoRollInitiative: z.boolean().default(false),
});

export const updateInitiativeSchema = z.object({
  encounterId: objectIdSchema,
  participantId: objectIdSchema,
  initiative: initiativeSchema,
});

export const damageParticipantSchema = z.object({
  encounterId: objectIdSchema,
  participantId: objectIdSchema,
  damage: z
    .number()
    .int('Damage must be a whole number')
    .min(0, 'Damage cannot be negative'),
  damageType: createOptionalSchema(
    z.string().max(50, 'Damage type cannot exceed 50 characters')
  ),
});

export const healParticipantSchema = z.object({
  encounterId: objectIdSchema,
  participantId: objectIdSchema,
  healing: z
    .number()
    .int('Healing must be a whole number')
    .min(0, 'Healing cannot be negative'),
});

export const addConditionSchema = z.object({
  encounterId: objectIdSchema,
  participantId: objectIdSchema,
  condition: z
    .string()
    .min(1, 'Condition name is required')
    .max(50, 'Condition name cannot exceed 50 characters'),
  duration: createOptionalSchema(
    z
      .number()
      .int('Duration must be a whole number')
      .min(1, 'Duration must be at least 1 round')
  ),
});

export const removeConditionSchema = z.object({
  encounterId: objectIdSchema,
  participantId: objectIdSchema,
  condition: z.string().min(1, 'Condition name is required'),
});

export const nextTurnSchema = z.object({
  encounterId: objectIdSchema,
});

export const endCombatSchema = z.object({
  encounterId: objectIdSchema,
});

// API request schemas
export const getEncounterByIdSchema = z.object({
  id: objectIdSchema,
});

export const getEncountersByOwnerSchema = z.object({
  ownerId: objectIdSchema,
  status: createOptionalSchema(encounterStatusSchema),
  includeShared: z.boolean().default(false),
});

export const searchEncountersSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Query cannot exceed 100 characters'),
  difficulty: createOptionalSchema(encounterDifficultySchema),
  targetLevel: createOptionalSchema(levelSchema),
  tags: createOptionalSchema(createArraySchema(z.string().max(30), 0, 5)),
  isPublic: createOptionalSchema(z.boolean()),
});

// Type exports for use throughout the application
export type Encounter = InferSchemaType<typeof encounterSchema>;
export type CreateEncounter = InferSchemaType<typeof createEncounterSchema>;
export type UpdateEncounter = InferSchemaType<typeof updateEncounterSchema>;
export type EncounterSummary = InferSchemaType<typeof encounterSummarySchema>;
export type ParticipantReference = InferSchemaType<
  typeof participantReferenceSchema
>;
export type InitiativeEntry = InferSchemaType<typeof initiativeEntrySchema>;
export type EncounterSettings = InferSchemaType<typeof encounterSettingsSchema>;
export type CombatState = InferSchemaType<typeof combatStateSchema>;
export type EncounterStatus = InferSchemaType<typeof encounterStatusSchema>;
export type EncounterDifficulty = InferSchemaType<
  typeof encounterDifficultySchema
>;
export type ParticipantType = InferSchemaType<typeof participantTypeSchema>;

// Combat action types
export type StartCombat = InferSchemaType<typeof startCombatSchema>;
export type UpdateInitiative = InferSchemaType<typeof updateInitiativeSchema>;
export type DamageParticipant = InferSchemaType<typeof damageParticipantSchema>;
export type HealParticipant = InferSchemaType<typeof healParticipantSchema>;
export type AddCondition = InferSchemaType<typeof addConditionSchema>;
export type RemoveCondition = InferSchemaType<typeof removeConditionSchema>;
export type NextTurn = InferSchemaType<typeof nextTurnSchema>;
export type EndCombat = InferSchemaType<typeof endCombatSchema>;

// API request types
export type GetEncounterById = InferSchemaType<typeof getEncounterByIdSchema>;
export type GetEncountersByOwner = InferSchemaType<
  typeof getEncountersByOwnerSchema
>;
export type SearchEncounters = InferSchemaType<typeof searchEncountersSchema>;
