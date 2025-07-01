import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { z } from 'zod';
import {
  encounterStatusSchema,
  encounterDifficultySchema,
  participantTypeSchema,
} from '../validations/encounter';

/**
 * Position interface for grid-based movement
 */
export interface IPosition {
  x: number;
  y: number;
}

/**
 * Participant reference interface for encounter participants
 */
export interface IParticipantReference {
  characterId: Types.ObjectId;
  name: string;
  type: z.infer<typeof participantTypeSchema>;
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  armorClass: number;
  initiative?: number;
  isPlayer: boolean;
  isVisible: boolean;
  notes: string;
  conditions: string[];
  position?: IPosition;
}

/**
 * Initiative entry interface for turn order tracking
 */
export interface IInitiativeEntry {
  participantId: Types.ObjectId;
  initiative: number;
  dexterity: number;
  isActive: boolean;
  hasActed: boolean;
}

/**
 * Encounter settings interface for combat configuration
 */
export interface IEncounterSettings {
  allowPlayerVisibility: boolean;
  autoRollInitiative: boolean;
  trackResources: boolean;
  enableLairActions: boolean;
  lairActionInitiative?: number;
  enableGridMovement: boolean;
  gridSize: number;
  roundTimeLimit?: number;
  experienceThreshold?: number;
}

/**
 * Combat state interface for active encounter tracking
 */
export interface ICombatState {
  isActive: boolean;
  currentRound: number;
  currentTurn: number;
  initiativeOrder: IInitiativeEntry[];
  startedAt?: Date;
  pausedAt?: Date;
  endedAt?: Date;
  totalDuration: number;
}

/**
 * Encounter document interface
 */
export interface IEncounter extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  tags: string[];
  difficulty?: z.infer<typeof encounterDifficultySchema>;
  estimatedDuration?: number;
  targetLevel?: number;
  participants: IParticipantReference[];
  settings: IEncounterSettings;
  combatState: ICombatState;
  status: z.infer<typeof encounterStatusSchema>;
  partyId?: Types.ObjectId;
  isPublic: boolean;
  sharedWith: Types.ObjectId[];
  version: number;
  createdAt: Date;
  updatedAt: Date;

  // Computed properties
  readonly participantCount: number;
  readonly playerCount: number;
  readonly isActive: boolean;
  readonly currentParticipant: IParticipantReference | null;

  // Instance methods
  addParticipant(_participant: Omit<IParticipantReference, 'characterId'> & { characterId: string }): void;
  removeParticipant(_participantId: string): boolean;
  updateParticipant(_participantId: string, _updates: Partial<IParticipantReference>): boolean;
  getParticipant(_participantId: string): IParticipantReference | null;
  startCombat(_autoRollInitiative?: boolean): void;
  endCombat(): void;
  nextTurn(): boolean;
  previousTurn(): boolean;
  setInitiative(_participantId: string, _initiative: number, _dexterity: number): boolean;
  applyDamage(_participantId: string, _damage: number): boolean;
  applyHealing(_participantId: string, _healing: number): boolean;
  addCondition(_participantId: string, _condition: string): boolean;
  removeCondition(_participantId: string, _condition: string): boolean;
  getInitiativeOrder(): IInitiativeEntry[];
  calculateDifficulty(): z.infer<typeof encounterDifficultySchema>;
  duplicateEncounter(_newName?: string): IEncounter;
  toSummary(): EncounterSummary;
}

/**
 * Encounter model interface with static methods
 */
export interface EncounterModel extends Model<IEncounter> {
  findByOwnerId(_ownerId: Types.ObjectId, _includeShared?: boolean): Promise<IEncounter[]>;
  findByStatus(_status: z.infer<typeof encounterStatusSchema>): Promise<IEncounter[]>;
  findPublic(): Promise<IEncounter[]>;
  searchByName(_searchTerm: string): Promise<IEncounter[]>;
  findByDifficulty(_difficulty: z.infer<typeof encounterDifficultySchema>): Promise<IEncounter[]>;
  findByTargetLevel(_level: number): Promise<IEncounter[]>;
  findActive(): Promise<IEncounter[]>;
  createEncounter(_encounterData: CreateEncounterInput): Promise<IEncounter>;
}

/**
 * Encounter summary interface for lightweight data
 */
export interface EncounterSummary {
  _id: Types.ObjectId;
  name: string;
  description: string;
  tags: string[];
  difficulty?: z.infer<typeof encounterDifficultySchema>;
  estimatedDuration?: number;
  targetLevel?: number;
  status: z.infer<typeof encounterStatusSchema>;
  isPublic: boolean;
  participantCount: number;
  playerCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create encounter input interface
 */
export interface CreateEncounterInput {
  ownerId: string;
  name: string;
  description?: string;
  tags?: string[];
  difficulty?: z.infer<typeof encounterDifficultySchema>;
  estimatedDuration?: number;
  targetLevel?: number;
  participants: Omit<IParticipantReference, 'characterId'>[];
  settings?: Partial<IEncounterSettings>;
  partyId?: string;
  isPublic?: boolean;
}

/**
 * Position schema
 */
const positionSchema = new Schema<IPosition>({
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
}, { _id: false });

/**
 * Participant reference schema
 */
const participantReferenceSchema = new Schema<IParticipantReference>({
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
  conditions: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  position: positionSchema,
}, { _id: false });

/**
 * Initiative entry schema
 */
const initiativeEntrySchema = new Schema<IInitiativeEntry>({
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
}, { _id: false });

/**
 * Encounter settings schema
 */
const encounterSettingsSchema = new Schema<IEncounterSettings>({
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
}, { _id: false });

/**
 * Combat state schema
 */
const combatStateSchema = new Schema<ICombatState>({
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
}, { _id: false });

/**
 * Main encounter schema
 */
const encounterSchema = new Schema<IEncounter, EncounterModel>({
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
  tags: [{
    type: String,
    trim: true,
    maxlength: 30,
  }],
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
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  version: {
    type: Number,
    default: 1,
    min: 1,
  },
}, {
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
});

// Virtual properties
encounterSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

encounterSchema.virtual('playerCount').get(function() {
  return this.participants.filter((p: IParticipantReference) => p.isPlayer).length;
});

encounterSchema.virtual('isActive').get(function() {
  return this.combatState.isActive;
});

encounterSchema.virtual('currentParticipant').get(function() {
  if (!this.combatState.isActive || this.combatState.initiativeOrder.length === 0) {
    return null;
  }

  const currentEntry = this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (!currentEntry) return null;

  return this.participants.find((p: IParticipantReference) =>
    p.characterId.toString() === currentEntry.participantId.toString()
  ) || null;
});

// Instance methods
encounterSchema.methods.addParticipant = function(
  participant: Omit<IParticipantReference, 'characterId'> & { characterId: string }
): void {
  this.participants.push({
    ...participant,
    characterId: new Types.ObjectId(participant.characterId),
  });
};

encounterSchema.methods.removeParticipant = function(participantId: string): boolean {
  const index = this.participants.findIndex((p: IParticipantReference) =>
    p.characterId.toString() === participantId
  );

  if (index === -1) return false;

  this.participants.splice(index, 1);

  // Remove from initiative order if present
  const initIndex = this.combatState.initiativeOrder.findIndex((entry: IInitiativeEntry) =>
    entry.participantId.toString() === participantId
  );

  if (initIndex !== -1) {
    this.combatState.initiativeOrder.splice(initIndex, 1);

    // Adjust current turn if necessary
    if (this.combatState.currentTurn >= initIndex && this.combatState.currentTurn > 0) {
      this.combatState.currentTurn--;
    }
  }

  return true;
};

encounterSchema.methods.updateParticipant = function(
  participantId: string,
  updates: Partial<IParticipantReference>
): boolean {
  const participant = this.participants.find((p: IParticipantReference) =>
    p.characterId.toString() === participantId
  );

  if (!participant) return false;

  Object.assign(participant, updates);
  return true;
};

encounterSchema.methods.getParticipant = function(participantId: string): IParticipantReference | null {
  return this.participants.find((p: IParticipantReference) =>
    p.characterId.toString() === participantId
  ) || null;
};

encounterSchema.methods.startCombat = function(autoRollInitiative = false): void {
  this.combatState.isActive = true;
  this.combatState.currentRound = 1;
  this.combatState.currentTurn = 0;
  this.combatState.startedAt = new Date();
  this.combatState.pausedAt = undefined;
  this.combatState.endedAt = undefined;
  this.status = 'active';

  // Initialize initiative order
  this.combatState.initiativeOrder = this.participants.map((participant: IParticipantReference) => ({
    participantId: participant.characterId,
    initiative: autoRollInitiative ? Math.floor(Math.random() * 20) + 1 : participant.initiative || 0,
    dexterity: 10, // Default dexterity, should be updated with actual character data
    isActive: false,
    hasActed: false,
  }));

  // Sort by initiative (highest first), then by dexterity (highest first)
  this.combatState.initiativeOrder.sort((a: IInitiativeEntry, b: IInitiativeEntry) => {
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative;
    }
    return b.dexterity - a.dexterity;
  });

  // Set first participant as active
  if (this.combatState.initiativeOrder.length > 0) {
    this.combatState.initiativeOrder[0].isActive = true;
  }
};

encounterSchema.methods.endCombat = function(): void {
  this.combatState.isActive = false;
  this.combatState.endedAt = new Date();
  this.status = 'completed';

  // Calculate total duration
  if (this.combatState.startedAt) {
    const endTime = this.combatState.endedAt.getTime();
    const startTime = this.combatState.startedAt.getTime();
    const pauseTime = this.combatState.pausedAt ?
      (this.combatState.pausedAt.getTime() - startTime) : 0;

    this.combatState.totalDuration = Math.max(0, endTime - startTime - pauseTime);
  }

  // Reset all active states
  this.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
    entry.isActive = false;
    entry.hasActed = false;
  });
};

encounterSchema.methods.nextTurn = function(): boolean {
  if (!this.combatState.isActive || this.combatState.initiativeOrder.length === 0) {
    return false;
  }

  // Mark current participant as having acted
  const currentEntry = this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.hasActed = true;
    currentEntry.isActive = false;
  }

  // Move to next turn
  this.combatState.currentTurn++;

  // Check if we need to start a new round
  if (this.combatState.currentTurn >= this.combatState.initiativeOrder.length) {
    this.combatState.currentTurn = 0;
    this.combatState.currentRound++;

    // Reset hasActed for new round
    this.combatState.initiativeOrder.forEach((entry: IInitiativeEntry) => {
      entry.hasActed = false;
    });
  }

  // Set next participant as active
  const nextEntry = this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (nextEntry) {
    nextEntry.isActive = true;
  }

  return true;
};

encounterSchema.methods.previousTurn = function(): boolean {
  if (!this.combatState.isActive || this.combatState.initiativeOrder.length === 0) {
    return false;
  }

  // Mark current participant as inactive
  const currentEntry = this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (currentEntry) {
    currentEntry.isActive = false;
  }

  // Move to previous turn
  this.combatState.currentTurn--;

  // Check if we need to go to previous round
  if (this.combatState.currentTurn < 0) {
    this.combatState.currentTurn = this.combatState.initiativeOrder.length - 1;
    this.combatState.currentRound = Math.max(1, this.combatState.currentRound - 1);
  }

  // Set previous participant as active
  const prevEntry = this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (prevEntry) {
    prevEntry.isActive = true;
    prevEntry.hasActed = false;
  }

  return true;
};

encounterSchema.methods.setInitiative = function(
  participantId: string,
  initiative: number,
  dexterity: number
): boolean {
  const entry = this.combatState.initiativeOrder.find((e: IInitiativeEntry) =>
    e.participantId.toString() === participantId
  );

  if (!entry) return false;

  entry.initiative = initiative;
  entry.dexterity = dexterity;

  // Re-sort initiative order
  this.combatState.initiativeOrder.sort((a: IInitiativeEntry, b: IInitiativeEntry) => {
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative;
    }
    return b.dexterity - a.dexterity;
  });

  // Update current turn index
  const activeEntry = this.combatState.initiativeOrder.find((e: IInitiativeEntry) => e.isActive);
  if (activeEntry) {
    this.combatState.currentTurn = this.combatState.initiativeOrder.findIndex((e: IInitiativeEntry) =>
      e.participantId.toString() === activeEntry.participantId.toString()
    );
  }

  return true;
};

encounterSchema.methods.applyDamage = function(participantId: string, damage: number): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant || damage < 0) return false;

  // Apply damage to temporary HP first
  if (participant.temporaryHitPoints > 0) {
    const tempDamage = Math.min(damage, participant.temporaryHitPoints);
    participant.temporaryHitPoints -= tempDamage;
    damage -= tempDamage;
  }

  // Apply remaining damage to current HP
  if (damage > 0) {
    participant.currentHitPoints = Math.max(0, participant.currentHitPoints - damage);
  }

  return true;
};

encounterSchema.methods.applyHealing = function(participantId: string, healing: number): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant || healing < 0) return false;

  participant.currentHitPoints = Math.min(
    participant.maxHitPoints,
    participant.currentHitPoints + healing
  );

  return true;
};

encounterSchema.methods.addCondition = function(participantId: string, condition: string): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant) return false;

  if (!participant.conditions.includes(condition)) {
    participant.conditions.push(condition);
  }

  return true;
};

encounterSchema.methods.removeCondition = function(participantId: string, condition: string): boolean {
  const participant = this.getParticipant(participantId);
  if (!participant) return false;

  const index = participant.conditions.indexOf(condition);
  if (index !== -1) {
    participant.conditions.splice(index, 1);
  }

  return true;
};

encounterSchema.methods.getInitiativeOrder = function(): IInitiativeEntry[] {
  return [...this.combatState.initiativeOrder];
};

encounterSchema.methods.calculateDifficulty = function(): z.infer<typeof encounterDifficultySchema> {
  // Simplified difficulty calculation based on participant count and target level
  const playerCount = this.playerCount;
  const nonPlayerCount = this.participants.length - playerCount;
  const ratio = nonPlayerCount / Math.max(playerCount, 1);

  if (ratio <= 0.5) return 'trivial';
  if (ratio <= 1) return 'easy';
  if (ratio <= 1.5) return 'medium';
  if (ratio <= 2) return 'hard';
  return 'deadly';
};

encounterSchema.methods.duplicateEncounter = function(newName?: string): IEncounter {
  const duplicateData = this.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  duplicateData.name = newName || `${this.name} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.combatState = {
    isActive: false,
    currentRound: 0,
    currentTurn: 0,
    initiativeOrder: [],
    totalDuration: 0,
  };
  duplicateData.version = 1;

  return new (this.constructor as EncounterModel)(duplicateData);
};

encounterSchema.methods.toSummary = function(): EncounterSummary {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    tags: this.tags,
    difficulty: this.difficulty,
    estimatedDuration: this.estimatedDuration,
    targetLevel: this.targetLevel,
    status: this.status,
    isPublic: this.isPublic,
    participantCount: this.participantCount,
    playerCount: this.playerCount,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static methods
encounterSchema.statics.findByOwnerId = function(
  ownerId: Types.ObjectId,
  includeShared = false
): Promise<IEncounter[]> {
  const query: any = includeShared
    ? { $or: [{ ownerId }, { sharedWith: ownerId }] }
    : { ownerId };

  return this.find(query).sort({ updatedAt: -1 });
};

encounterSchema.statics.findByStatus = function(
  status: z.infer<typeof encounterStatusSchema>
): Promise<IEncounter[]> {
  return this.find({ status }).sort({ updatedAt: -1 });
};

encounterSchema.statics.findPublic = function(): Promise<IEncounter[]> {
  return this.find({ isPublic: true }).sort({ updatedAt: -1 });
};

encounterSchema.statics.searchByName = function(searchTerm: string): Promise<IEncounter[]> {
  return this.find({
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

encounterSchema.statics.findByDifficulty = function(
  difficulty: z.infer<typeof encounterDifficultySchema>
): Promise<IEncounter[]> {
  return this.find({ difficulty }).sort({ updatedAt: -1 });
};

encounterSchema.statics.findByTargetLevel = function(level: number): Promise<IEncounter[]> {
  return this.find({ targetLevel: level }).sort({ updatedAt: -1 });
};

encounterSchema.statics.findActive = function(): Promise<IEncounter[]> {
  return this.find({ 'combatState.isActive': true }).sort({ 'combatState.startedAt': -1 });
};

encounterSchema.statics.createEncounter = async function(
  encounterData: CreateEncounterInput
): Promise<IEncounter> {
  const encounter = new this({
    ownerId: new Types.ObjectId(encounterData.ownerId),
    name: encounterData.name,
    description: encounterData.description || '',
    tags: encounterData.tags || [],
    difficulty: encounterData.difficulty,
    estimatedDuration: encounterData.estimatedDuration,
    targetLevel: encounterData.targetLevel,
    participants: encounterData.participants,
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: false,
      enableGridMovement: false,
      gridSize: 5,
      ...encounterData.settings,
    },
    partyId: encounterData.partyId ? new Types.ObjectId(encounterData.partyId) : undefined,
    isPublic: encounterData.isPublic || false,
  });

  await encounter.save();
  return encounter;
};

// Pre-save middleware
encounterSchema.pre('save', function(next) {
  // Ensure current HP doesn't exceed maximum for all participants
  this.participants.forEach((participant: IParticipantReference) => {
    if (participant.currentHitPoints > participant.maxHitPoints) {
      participant.currentHitPoints = participant.maxHitPoints;
    }
    if (participant.temporaryHitPoints < 0) {
      participant.temporaryHitPoints = 0;
    }
  });

  // Increment version on updates (except for new documents)
  if (!this.isNew) {
    this.version += 1;
  }

  next();
});

// Post-save middleware
encounterSchema.post('save', function(doc, next) {
  console.log(`Encounter saved: ${doc.name} (ID: ${doc._id})`);
  next();
});

// Indexes for performance
encounterSchema.index({ ownerId: 1, status: 1 });
encounterSchema.index({ ownerId: 1, updatedAt: -1 });
encounterSchema.index({ isPublic: 1, difficulty: 1 });
encounterSchema.index({ targetLevel: 1, difficulty: 1 });
encounterSchema.index({ tags: 1 });
encounterSchema.index({ 'combatState.isActive': 1 });
encounterSchema.index({ sharedWith: 1 });
encounterSchema.index({ partyId: 1 });

// Create and export the model
export const Encounter = mongoose.model<IEncounter, EncounterModel>('Encounter', encounterSchema);