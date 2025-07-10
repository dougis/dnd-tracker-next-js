import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import {
  abilityScoreField,
  savingThrowField,
  hitPointsSchema,
  hitPointsUtils,
  getStandardSchemaOptions,
  mongooseObjectIdField,
  commonFields,
  dndFields,
  commonIndexes,
  validationHelpers,
  type IHitPoints,
} from './shared/schema-utils';
import type { CharacterSummary as ValidationCharacterSummary } from '../validations/character';

// Ability name type for calculations
type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

// Character document interface
export interface ICharacter extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  type: 'pc' | 'npc';
  race: string;
  customRace?: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  classes: Array<{
    class: string;
    level: number;
    subclass?: string;
    hitDie: number;
  }>;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: IHitPoints;
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
  savingThrows: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
  };
  skills: Map<string, boolean>;
  equipment: Array<{
    name: string;
    quantity: number;
    weight: number;
    value: number;
    description?: string;
    equipped: boolean;
    magical: boolean;
  }>;
  spells: Array<{
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    description: string;
    isPrepared: boolean;
  }>;
  backstory: string;
  notes: string;
  imageUrl?: string;
  isPublic: boolean;
  partyId?: Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date;
  undoToken?: string;
  undoExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Computed properties
  readonly level: number;

  // Instance methods
  getAbilityModifier(_ability: AbilityName): number;
  getInitiativeModifier(): number;
  getEffectiveHP(): number;
  isAlive(): boolean;
  isUnconscious(): boolean;
  takeDamage(_damage: number): void;
  heal(_healing: number): void;
  addTemporaryHP(_tempHP: number): void;
  toSummary(): ValidationCharacterSummary;
}

// Character model interface with static methods
export interface CharacterModel extends Model<ICharacter> {
  findByOwnerId(_ownerId: Types.ObjectId): Promise<ICharacter[]>;
  findByType(_characterType: 'pc' | 'npc'): Promise<ICharacter[]>;
  findPublic(): Promise<ICharacter[]>;
  searchByName(_searchTerm: string): Promise<ICharacter[]>;
  findByClass(_className: string): Promise<ICharacter[]>;
  findByRace(_race: string): Promise<ICharacter[]>;
}

// Re-export the validation CharacterSummary type for consistency
export type CharacterSummary = ValidationCharacterSummary;

// Mongoose schema definition
const characterSchema = new Schema<ICharacter, CharacterModel>(
  {
    ownerId: mongooseObjectIdField('User'),
    name: {
      ...commonFields.name,
      index: 'text',
    },
    type: {
      type: String,
      enum: ['pc', 'npc'],
      required: true,
      index: true,
    },
    race: {
      type: String,
      required: true,
      trim: true,
    },
    customRace: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    size: {
      type: String,
      enum: ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'],
      default: 'medium',
    },
    classes: [
      {
        class: {
          type: String,
          required: true,
        },
        level: dndFields.characterLevel,
        subclass: {
          type: String,
          trim: true,
        },
        hitDie: dndFields.hitDie,
      },
    ],
    abilityScores: {
      strength: abilityScoreField,
      dexterity: abilityScoreField,
      constitution: abilityScoreField,
      intelligence: abilityScoreField,
      wisdom: abilityScoreField,
      charisma: abilityScoreField,
    },
    hitPoints: hitPointsSchema,
    armorClass: dndFields.armorClass,
    speed: dndFields.speed,
    proficiencyBonus: dndFields.proficiencyBonus,
    savingThrows: {
      strength: savingThrowField,
      dexterity: savingThrowField,
      constitution: savingThrowField,
      intelligence: savingThrowField,
      wisdom: savingThrowField,
      charisma: savingThrowField,
    },
    skills: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    equipment: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 0,
        },
        weight: {
          type: Number,
          default: 0,
          min: 0,
        },
        value: {
          type: Number,
          default: 0,
          min: 0,
        },
        description: {
          type: String,
          trim: true,
        },
        equipped: {
          type: Boolean,
          default: false,
        },
        magical: {
          type: Boolean,
          default: false,
        },
      },
    ],
    spells: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        level: dndFields.spellLevel,
        school: {
          type: String,
          required: true,
          trim: true,
        },
        castingTime: {
          type: String,
          required: true,
          trim: true,
        },
        range: {
          type: String,
          required: true,
          trim: true,
        },
        components: {
          type: String,
          required: true,
          trim: true,
        },
        duration: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        isPrepared: {
          type: Boolean,
          default: false,
        },
      },
    ],
    backstory: commonFields.backstory,
    notes: commonFields.notes,
    imageUrl: commonFields.imageUrl,
    isPublic: commonFields.isPublic,
    partyId: mongooseObjectIdField('Party', false),
    isDeleted: commonFields.isDeleted,
    deletedAt: commonFields.deletedAt,
    undoToken: {
      type: String,
      trim: true,
    },
    undoExpiresAt: {
      type: Date,
    },
  },
  getStandardSchemaOptions()
);

// Virtual for total character level
characterSchema.virtual('level').get(function () {
  return this.classes.reduce(
    (total: number, charClass: any) => total + charClass.level,
    0
  );
});

// Instance method: Calculate ability modifier
characterSchema.methods.getAbilityModifier = function (
  ability: AbilityName
): number {
  const score = this.abilityScores[ability];
  return validationHelpers.getAbilityModifier(score);
};

// Instance method: Calculate initiative modifier
characterSchema.methods.getInitiativeModifier = function (): number {
  return this.getAbilityModifier('dexterity');
};

// Instance method: Get effective HP (current + temporary)
characterSchema.methods.getEffectiveHP = function (): number {
  return hitPointsUtils.getEffectiveHP(this.hitPoints);
};

// Instance method: Check if character is alive
characterSchema.methods.isAlive = function (): boolean {
  return hitPointsUtils.isAlive(this.hitPoints);
};

// Instance method: Check if character is unconscious
characterSchema.methods.isUnconscious = function (): boolean {
  return hitPointsUtils.isUnconscious(this.hitPoints);
};

// Instance method: Apply damage
characterSchema.methods.takeDamage = function (damage: number): void {
  hitPointsUtils.takeDamage(this.hitPoints, damage);
};

// Instance method: Heal damage
characterSchema.methods.heal = function (healing: number): void {
  hitPointsUtils.heal(this.hitPoints, healing);
};

// Instance method: Add temporary HP
characterSchema.methods.addTemporaryHP = function (tempHP: number): void {
  hitPointsUtils.addTemporaryHP(this.hitPoints, tempHP);
};

// Instance method: Get character summary
characterSchema.methods.toSummary = function (): ValidationCharacterSummary {
  return {
    _id: this._id.toString(),
    name: this.name,
    type: this.type,
    race: this.race,
    customRace: this.customRace,
    classes: this.classes,
    level: this.level,
    hitPoints: {
      maximum: this.hitPoints.maximum,
      current: this.hitPoints.current,
    },
    armorClass: this.armorClass,
    ownerId: this.ownerId.toString(),
    partyId: this.partyId?.toString(),
    imageUrl: this.imageUrl,
  };
};

// Static method: Find characters by owner ID
characterSchema.statics.findByOwnerId = function (ownerId: Types.ObjectId) {
  return this.find({ ownerId }).sort({ name: 1 });
};

// Static method: Find characters by type
characterSchema.statics.findByType = function (characterType: 'pc' | 'npc') {
  return this.find({ type: characterType }).sort({ name: 1 });
};

// Static method: Find public characters
characterSchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ name: 1 });
};

// Static method: Search characters by name
characterSchema.statics.searchByName = function (searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method: Find characters by class
characterSchema.statics.findByClass = function (className: string) {
  return this.find({
    'classes.class': className,
  }).sort({ name: 1 });
};

// Static method: Find characters by race
characterSchema.statics.findByRace = function (race: string) {
  return this.find({ race }).sort({ name: 1 });
};

// Pre-save middleware for validation
characterSchema.pre('save', function (next) {
  // Ensure current HP doesn't exceed maximum
  if (this.hitPoints.current > this.hitPoints.maximum) {
    this.hitPoints.current = this.hitPoints.maximum;
  }

  // Ensure temporary HP is not negative
  if (this.hitPoints.temporary < 0) {
    this.hitPoints.temporary = 0;
  }

  next();
});

// Post-save middleware for logging
characterSchema.post('save', function (doc, next) {
  console.log(`Character saved: ${doc.name} (ID: ${doc._id})`);
  next();
});

// Apply common indexes
commonIndexes.ownerBased(characterSchema);
commonIndexes.publicContent(characterSchema);
commonIndexes.temporal(characterSchema);
commonIndexes.dndContent(characterSchema);

// Character-specific indexes
characterSchema.index({ 'classes.class': 1 });
characterSchema.index({ race: 1 });


// Create and export the model
export const Character =
  (mongoose.models.Character as CharacterModel) ||
  mongoose.model<ICharacter, CharacterModel>('Character', characterSchema);
