import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { z } from 'zod';
import { 
  characterCreationSchema, 
  characterUpdateSchema,
  type CharacterClass,
  type Character as ValidatedCharacter,
  type CharacterCreation,
  type CharacterType,
  type DnDRace,
  type DnDClass,
  type AbilityName
} from '../validations/character';

// Base Character interface from validation schema
export type ICharacter = CharacterCreation & {
  _id?: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId; // Maps to userId in our system
  createdAt?: Date;
  updatedAt?: Date;
};

// Character document interface with instance methods
export interface ICharacterDocument extends ICharacter, Document {
  _id: mongoose.Types.ObjectId;
  
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
export interface ICharacterModel extends Model<ICharacterDocument> {
  findByOwnerId(_ownerId: mongoose.Types.ObjectId): Promise<ICharacterDocument[]>;
  findByType(_characterType: CharacterType): Promise<ICharacterDocument[]>;
  findPublic(): Promise<ICharacterDocument[]>;
  searchByName(_searchTerm: string): Promise<ICharacterDocument[]>;
  findByClass(_className: DnDClass): Promise<ICharacterDocument[]>;
  findByRace(_race: DnDRace): Promise<ICharacterDocument[]>;
}

// Summary type for lightweight character data
export interface CharacterSummary {
  _id: mongoose.Types.ObjectId;
  name: string;
  race: DnDRace | string;
  type: CharacterType;
  level: number;
  classes: CharacterClass[];
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
  };
  armorClass: number;
  isPublic?: boolean;
}

// Mongoose schema definition
const CharacterSchema = new Schema<ICharacterDocument, ICharacterModel>({
  ownerId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: 'text'
  },
  type: {
    type: String,
    enum: ['pc', 'npc'],
    required: true,
    index: true
  },
  race: {
    type: String,
    required: true,
    trim: true
  },
  customRace: {
    type: String,
    trim: true,
    maxlength: 50
  },
  size: {
    type: String,
    enum: ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'],
    default: 'medium'
  },
  classes: [{
    class: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    subclass: {
      type: String,
      trim: true
    },
    hitDie: {
      type: Number,
      required: true,
      min: 4,
      max: 12
    }
  }],
  abilityScores: {
    strength: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    dexterity: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    constitution: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    intelligence: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    wisdom: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    charisma: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    }
  },
  hitPoints: {
    maximum: {
      type: Number,
      required: true,
      min: 1
    },
    current: {
      type: Number,
      required: true,
      min: 0
    },
    temporary: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  armorClass: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  speed: {
    type: Number,
    required: true,
    min: 0,
    default: 30
  },
  proficiencyBonus: {
    type: Number,
    required: true,
    min: 2,
    max: 6
  },
  savingThrows: {
    strength: {
      type: Boolean,
      default: false
    },
    dexterity: {
      type: Boolean,
      default: false
    },
    constitution: {
      type: Boolean,
      default: false
    },
    intelligence: {
      type: Boolean,
      default: false
    },
    wisdom: {
      type: Boolean,
      default: false
    },
    charisma: {
      type: Boolean,
      default: false
    }
  },
  skills: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  equipment: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    weight: {
      type: Number,
      default: 0,
      min: 0
    },
    value: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    equipped: {
      type: Boolean,
      default: false
    },
    magical: {
      type: Boolean,
      default: false
    }
  }],
  spells: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },
    school: {
      type: String,
      required: true,
      trim: true
    },
    castingTime: {
      type: String,
      required: true,
      trim: true
    },
    range: {
      type: String,
      required: true,
      trim: true
    },
    components: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isPrepared: {
      type: Boolean,
      default: false
    }
  }],
  backstory: {
    type: String,
    default: '',
    maxlength: 5000
  },
  notes: {
    type: String,
    default: '',
    maxlength: 2000
  },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  partyId: {
    type: Types.ObjectId,
    ref: 'Party',
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for total character level
CharacterSchema.virtual('level').get(function() {
  return this.classes.reduce((total: number, charClass: any) => total + charClass.level, 0);
});

// Instance method: Calculate ability modifier
CharacterSchema.methods.getAbilityModifier = function(ability: AbilityName): number {
  const score = this.abilityScores[ability];
  return Math.floor((score - 10) / 2);
};

// Instance method: Calculate initiative modifier
CharacterSchema.methods.getInitiativeModifier = function(): number {
  return this.getAbilityModifier('dexterity');
};

// Instance method: Get effective HP (current + temporary)
CharacterSchema.methods.getEffectiveHP = function(): number {
  return this.hitPoints.current + this.hitPoints.temporary;
};

// Instance method: Check if character is alive
CharacterSchema.methods.isAlive = function(): boolean {
  return this.hitPoints.current > 0;
};

// Instance method: Check if character is unconscious
CharacterSchema.methods.isUnconscious = function(): boolean {
  return this.hitPoints.current <= 0;
};

// Instance method: Apply damage
CharacterSchema.methods.takeDamage = function(damage: number): void {
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
CharacterSchema.methods.heal = function(healing: number): void {
  if (healing <= 0) return;
  
  this.hitPoints.current = Math.min(
    this.hitPoints.maximum,
    this.hitPoints.current + healing
  );
};

// Instance method: Add temporary HP
CharacterSchema.methods.addTemporaryHP = function(tempHP: number): void {
  if (tempHP <= 0) return;
  
  // Temporary HP doesn't stack, take the higher value
  this.hitPoints.temporary = Math.max(this.hitPoints.temporary, tempHP);
};

// Instance method: Get character summary
CharacterSchema.methods.toSummary = function(): CharacterSummary {
  return {
    _id: this._id,
    name: this.name,
    race: this.race,
    type: this.type,
    level: this.level,
    classes: this.classes,
    hitPoints: this.hitPoints,
    armorClass: this.armorClass,
    isPublic: this.isPublic
  };
};

// Static method: Find characters by owner ID
CharacterSchema.statics.findByOwnerId = function(ownerId: mongoose.Types.ObjectId) {
  return this.find({ ownerId }).sort({ name: 1 });
};

// Static method: Find characters by type
CharacterSchema.statics.findByType = function(characterType: CharacterType) {
  return this.find({ type: characterType }).sort({ name: 1 });
};

// Static method: Find public characters
CharacterSchema.statics.findPublic = function() {
  return this.find({ isPublic: true }).sort({ name: 1 });
};

// Static method: Search characters by name
CharacterSchema.statics.searchByName = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm }
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method: Find characters by class
CharacterSchema.statics.findByClass = function(className: DnDClass) {
  return this.find({
    'classes.class': className
  }).sort({ name: 1 });
};

// Static method: Find characters by race
CharacterSchema.statics.findByRace = function(race: DnDRace) {
  return this.find({ race }).sort({ name: 1 });
};

// Pre-save middleware for validation
CharacterSchema.pre('save', function(next) {
  // Validate with Zod schema
  const validation = this.isNew 
    ? characterCreationSchema.safeParse(this.toObject())
    : characterUpdateSchema.safeParse(this.toObject());
    
  if (!validation.success) {
    const error = new Error(`Character validation failed: ${validation.error.message}`);
    return next(error);
  }
  
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
CharacterSchema.post('save', function(doc, next) {
  console.log(`Character saved: ${doc.name} (ID: ${doc._id})`);
  next();
});

// Indexes for performance
CharacterSchema.index({ ownerId: 1, name: 1 });
CharacterSchema.index({ type: 1, isPublic: 1 });
CharacterSchema.index({ 'classes.class': 1 });
CharacterSchema.index({ race: 1 });
CharacterSchema.index({ partyId: 1 });

// Create and export the model
export const Character = mongoose.model<ICharacterDocument, ICharacterModel>('Character', CharacterSchema);

// Export types for use in other files
export type { ICharacter, ICharacterDocument, ICharacterModel, CharacterSummary };