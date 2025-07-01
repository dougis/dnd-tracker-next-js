import { Document, Model, Types } from 'mongoose';
import { z } from 'zod';
import {
  encounterStatusSchema,
  encounterDifficultySchema,
  participantTypeSchema,
} from '../../validations/encounter';

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