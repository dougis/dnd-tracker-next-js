import { Schema } from 'mongoose';
import {
  IPosition,
  IParticipantReference,
  IInitiativeEntry,
  IEncounterSettings,
  ICombatState,
  IEncounter,
  EncounterModel,
} from './interfaces';
import {
  getStandardSchemaOptions,
  mongooseObjectIdField,
  commonFields,
  dndFields,
  commonIndexes,
  DND_VALIDATION_RANGES,
} from '../shared/schema-utils';

/**
 * Position schema for grid-based movement
 */
export const positionSchema = new Schema<IPosition>(
  {
    x: {
      type: Number,
      required: true,
      min: 0,
    },
    y: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Participant reference schema for encounter participants
 */
export const participantReferenceSchema = new Schema<IParticipantReference>(
  {
    characterId: mongooseObjectIdField('Character'),
    name: commonFields.name,
    type: {
      type: String,
      enum: ['pc', 'npc', 'monster'],
      required: true,
      index: true,
    },
    maxHitPoints: {
      type: Number,
      required: true,
      ...DND_VALIDATION_RANGES.HIT_POINTS_MAX,
    },
    currentHitPoints: {
      type: Number,
      required: true,
      ...DND_VALIDATION_RANGES.HIT_POINTS,
    },
    temporaryHitPoints: {
      type: Number,
      default: 0,
      ...DND_VALIDATION_RANGES.HIT_POINTS,
    },
    armorClass: dndFields.armorClass,
    initiative: dndFields.initiative,
    isPlayer: {
      type: Boolean,
      default: false,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    notes: commonFields.notes,
    conditions: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    position: positionSchema,
  },
  { _id: false }
);

/**
 * Initiative entry schema for turn order tracking
 */
export const initiativeEntrySchema = new Schema<IInitiativeEntry>(
  {
    participantId: mongooseObjectIdField('', true, false),
    initiative: {
      type: Number,
      required: true,
      ...DND_VALIDATION_RANGES.INITIATIVE,
    },
    dexterity: {
      type: Number,
      required: true,
      ...DND_VALIDATION_RANGES.ABILITY_SCORE,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    hasActed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * Encounter settings schema for combat configuration
 */
export const encounterSettingsSchema = new Schema<IEncounterSettings>(
  {
    allowPlayerVisibility: {
      type: Boolean,
      default: true,
    },
    autoRollInitiative: {
      type: Boolean,
      default: false,
    },
    trackResources: {
      type: Boolean,
      default: true,
    },
    enableLairActions: {
      type: Boolean,
      default: false,
    },
    lairActionInitiative: dndFields.initiative,
    enableGridMovement: {
      type: Boolean,
      default: false,
    },
    gridSize: {
      type: Number,
      min: 1,
      max: 50,
      default: 5,
    },
    roundTimeLimit: {
      type: Number,
      min: 30,
      max: 600,
    },
    experienceThreshold: {
      type: Number,
      ...DND_VALIDATION_RANGES.CHARACTER_LEVEL,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Combat state schema for active encounter tracking
 */
export const combatStateSchema = new Schema<ICombatState>(
  {
    isActive: {
      type: Boolean,
      default: false,
    },
    currentRound: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentTurn: {
      type: Number,
      default: 0,
      min: 0,
    },
    initiativeOrder: [initiativeEntrySchema],
    startedAt: {
      type: Date,
      index: true,
    },
    pausedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
      index: true,
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Main encounter schema definition
 */
export const encounterSchema = new Schema<IEncounter, EncounterModel>(
  {
    ownerId: mongooseObjectIdField('User'),
    name: {
      ...commonFields.name,
      index: 'text',
    },
    description: commonFields.description,
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10 && tags.every(tag => tag.length <= 30),
        message: 'Cannot have more than 10 tags, each max 30 characters',
      },
    },
    difficulty: {
      type: String,
      enum: ['trivial', 'easy', 'medium', 'hard', 'deadly'],
      index: true,
    },
    estimatedDuration: {
      type: Number,
      min: 1,
      max: 480,
    },
    targetLevel: dndFields.targetLevel,
    participants: [participantReferenceSchema],
    settings: {
      type: encounterSettingsSchema,
      default: () => ({}),
    },
    combatState: {
      type: combatStateSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
      index: true,
    },
    partyId: mongooseObjectIdField('Party', false),
    isPublic: commonFields.isPublic,
    sharedWith: [mongooseObjectIdField('User', false, false)],
    version: commonFields.version,
  },
  getStandardSchemaOptions()
);

// Apply common indexes
commonIndexes.ownerBased(encounterSchema);
commonIndexes.publicContent(encounterSchema);
commonIndexes.temporal(encounterSchema);
commonIndexes.dndContent(encounterSchema);

// Encounter-specific indexes
encounterSchema.index({ ownerId: 1, status: 1 });
encounterSchema.index({ isPublic: 1, difficulty: 1 });
encounterSchema.index({ targetLevel: 1, difficulty: 1 });
encounterSchema.index({ 'combatState.isActive': 1 });
encounterSchema.index({ sharedWith: 1 });

