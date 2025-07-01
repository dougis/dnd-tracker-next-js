import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import {
  abilityScoreField,
  savingThrowField,
  hitPointsSchema,
  getStandardSchemaOptions,
} from './shared/schema-utils';

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
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
  };
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
  toSummary(): CharacterSummary;
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

// Summary type for lightweight character data
export interface CharacterSummary {
  _id: Types.ObjectId;
  name: string;
  race: string;
  type: 'pc' | 'npc';
  level: number;
  classes: Array<{
    class: string;
    level: number;
    subclass?: string;
    hitDie: number;
  }>;
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
  };
  armorClass: number;
  isPublic: boolean;
}

// Mongoose schema definition
const characterSchema = new Schema<ICharacter, CharacterModel>(
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
        level: {
          type: Number,
          required: true,
          min: 1,
          max: 20,
        },
        subclass: {
          type: String,
          trim: true,
        },
        hitDie: {
          type: Number,
          required: true,
          min: 4,
          max: 12,
        },
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
    armorClass: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    speed: {
      type: Number,
      required: true,
      min: 0,
      default: 30,
    },
    proficiencyBonus: {
      type: Number,
      required: true,
      min: 2,
      max: 6,
    },
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
        level: {
          type: Number,
          required: true,
          min: 0,
          max: 9,
        },
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
    backstory: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      index: true,
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
  return Math.floor((score - 10) / 2);
};

// Instance method: Calculate initiative modifier
characterSchema.methods.getInitiativeModifier = function (): number {
  return this.getAbilityModifier('dexterity');
};

// Instance method: Get effective HP (current + temporary)
characterSchema.methods.getEffectiveHP = function (): number {
  return this.hitPoints.current + this.hitPoints.temporary;
};

// Instance method: Check if character is alive
characterSchema.methods.isAlive = function (): boolean {
  return this.hitPoints.current > 0;
};

// Instance method: Check if character is unconscious
characterSchema.methods.isUnconscious = function (): boolean {
  return this.hitPoints.current <= 0;
};

// Instance method: Apply damage
characterSchema.methods.takeDamage = function (damage: number): void {
  if (damage <= 0) return;

  // Apply damage to temporary HP first
  if (this.hitPoints.temporary > 0) {
    const tempDamage = Math.min(damage, this.hitPoints.temporary);
    this.hitPoints.temporary -= tempDamage;
    damage -= tempDamage;
  }

  // Apply remaining damage to current HP
  if (damage > 0) {
    this.hitPoints.current = Math.max(0, this.hitPoints.current - damage);
  }
};

// Instance method: Heal damage
characterSchema.methods.heal = function (healing: number): void {
  if (healing <= 0) return;

  this.hitPoints.current = Math.min(
    this.hitPoints.maximum,
    this.hitPoints.current + healing
  );
};

// Instance method: Add temporary HP
characterSchema.methods.addTemporaryHP = function (tempHP: number): void {
  if (tempHP <= 0) return;

  // Temporary HP doesn't stack, take the higher value
  this.hitPoints.temporary = Math.max(this.hitPoints.temporary, tempHP);
};

// Instance method: Get character summary
characterSchema.methods.toSummary = function (): CharacterSummary {
  return {
    _id: this._id,
    name: this.name,
    race: this.race,
    type: this.type,
    level: this.level,
    classes: this.classes,
    hitPoints: this.hitPoints,
    armorClass: this.armorClass,
    isPublic: this.isPublic,
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

// Indexes for performance
characterSchema.index({ ownerId: 1, name: 1 });
characterSchema.index({ type: 1, isPublic: 1 });
characterSchema.index({ 'classes.class': 1 });
characterSchema.index({ race: 1 });
characterSchema.index({ partyId: 1 });

// Create and export the model
export const Character = mongoose.model<ICharacter, CharacterModel>(
  'Character',
  characterSchema
);
