import mongoose, { Schema } from 'mongoose';
import {
  IPosition,
  IParticipantReference,
  IInitiativeEntry,
  IEncounterSettings,
  ICombatState,
  IEncounter,
  EncounterModel,
} from './interfaces';

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
    characterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ['pc', 'npc', 'monster'],
      required: true,
      index: true,
    },
    maxHitPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    currentHitPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    temporaryHitPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    armorClass: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    initiative: {
      type: Number,
      min: -10,
      max: 30,
    },
    isPlayer: {
      type: Boolean,
      default: false,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
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
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    initiative: {
      type: Number,
      required: true,
      min: -10,
      max: 30,
    },
    dexterity: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
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
    lairActionInitiative: {
      type: Number,
      min: -10,
      max: 30,
    },
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
      min: 0,
      max: 30,
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
      index: true,
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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: 'text',
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
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
    targetLevel: {
      type: Number,
      min: 1,
      max: 20,
      index: true,
    },
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
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for performance optimization
encounterSchema.index({ ownerId: 1, status: 1 });
encounterSchema.index({ ownerId: 1, updatedAt: -1 });
encounterSchema.index({ isPublic: 1, difficulty: 1 });
encounterSchema.index({ targetLevel: 1, difficulty: 1 });
encounterSchema.index({ tags: 1 });
encounterSchema.index({ 'combatState.isActive': 1 });
encounterSchema.index({ sharedWith: 1 });
encounterSchema.index({ partyId: 1 });
