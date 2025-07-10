import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import {
  getStandardSchemaOptions,
  mongooseObjectIdField,
  commonFields,
  commonIndexes,
} from './shared/schema-utils';

// Party document interface
export interface IParty extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  sharedWith: Types.ObjectId[];
  settings: {
    allowJoining: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;

  // Virtual properties
  readonly memberCount: number;
  readonly playerCharacterCount: number;
  readonly averageLevel: number;

  // Instance methods
  addMember(_characterId: Types.ObjectId): Promise<void>;
  removeMember(_characterId: Types.ObjectId): Promise<void>;
  getMembers(): Promise<any[]>;
  updateActivity(): void;
}

// Party model interface with static methods
export interface PartyModel extends Model<IParty> {
  findByOwnerId(_ownerId: Types.ObjectId): Promise<IParty[]>;
  findPublic(): Promise<IParty[]>;
  searchByName(_searchTerm: string): Promise<IParty[]>;
  findSharedWith(_userId: Types.ObjectId): Promise<IParty[]>;
}

// Mongoose schema definition
const partySchema = new Schema<IParty, PartyModel>(
  {
    ownerId: mongooseObjectIdField('User'),
    name: {
      ...commonFields.name,
      index: 'text',
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Party cannot have more than 10 tags',
      },
    },
    isPublic: commonFields.isPublic,
    sharedWith: {
      type: [mongooseObjectIdField('User', false).type],
      default: [],
      validate: {
        validator: function (userIds: Types.ObjectId[]) {
          return userIds.length <= 50;
        },
        message: 'Party cannot be shared with more than 50 users',
      },
    },
    settings: {
      allowJoining: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
      maxMembers: {
        type: Number,
        default: 6,
        min: [1, 'Party must allow at least 1 member'],
        max: [100, 'Party cannot have more than 100 members'],
      },
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  getStandardSchemaOptions()
);

// Virtual for member count
partySchema.virtual('memberCount', {
  ref: 'Character',
  localField: '_id',
  foreignField: 'partyId',
  count: true,
});

// Virtual for player character count
partySchema.virtual('playerCharacterCount').get(async function () {
  const Character = mongoose.model('Character');
  const count = await Character.countDocuments({
    partyId: this._id,
    type: 'pc',
    isDeleted: { $ne: true },
  });
  return count;
});

// Helper function to calculate character total level
function calculateCharacterLevel(character: any): number {
  return character.classes.reduce((sum: number, charClass: any) => sum + charClass.level, 0);
}

// Virtual for average level
partySchema.virtual('averageLevel').get(async function () {
  const Character = mongoose.model('Character');
  const members = await Character.find({
    partyId: this._id,
    isDeleted: { $ne: true },
  });

  if (members.length === 0) return 0;

  const totalLevel = members.reduce((sum, character) => sum + calculateCharacterLevel(character), 0);
  return Math.round(totalLevel / members.length);
});

// Instance method: Add member to party
partySchema.methods.addMember = async function (characterId: Types.ObjectId): Promise<void> {
  const Character = mongoose.model('Character');

  // Check if party is at max capacity
  const currentMemberCount = await Character.countDocuments({
    partyId: this._id,
    isDeleted: { $ne: true },
  });

  if (currentMemberCount >= this.settings.maxMembers) {
    throw new Error('Party is at maximum capacity');
  }

  // Update character's partyId
  await Character.findByIdAndUpdate(characterId, {
    partyId: this._id,
  });

  // Update party's last activity
  this.updateActivity();
};

// Instance method: Remove member from party
partySchema.methods.removeMember = async function (characterId: Types.ObjectId): Promise<void> {
  const Character = mongoose.model('Character');

  // Remove partyId from character
  await Character.findByIdAndUpdate(characterId, {
    $unset: { partyId: 1 },
  });

  // Update party's last activity
  this.updateActivity();
};

// Instance method: Get all party members
partySchema.methods.getMembers = async function (): Promise<any[]> {
  const Character = mongoose.model('Character');

  return await Character.find({
    partyId: this._id,
    isDeleted: { $ne: true },
  }).sort({ name: 1 });
};

// Instance method: Update last activity
partySchema.methods.updateActivity = function (): void {
  this.lastActivity = new Date();
  this.save();
};

// Static method: Find parties by owner ID
partySchema.statics.findByOwnerId = function (ownerId: Types.ObjectId) {
  return this.find({ ownerId }).sort({ name: 1 });
};

// Static method: Find public parties
partySchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ name: 1 });
};

// Static method: Search parties by name
partySchema.statics.searchByName = function (searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method: Find parties shared with user
partySchema.statics.findSharedWith = function (userId: Types.ObjectId) {
  return this.find({
    sharedWith: userId,
  }).sort({ name: 1 });
};

// Pre-save middleware for validation
partySchema.pre('save', function (next) {
  // Ensure name is not empty
  if (!this.name || this.name.trim().length === 0) {
    return next(new Error('Party name is required'));
  }

  // Update lastActivity on save
  if (!this.lastActivity) {
    this.lastActivity = new Date();
  }

  next();
});

// Post-save middleware for logging
partySchema.post('save', function (doc, next) {
  console.log(`Party saved: ${doc.name} (ID: ${doc._id})`);
  next();
});

// Apply common indexes
commonIndexes.ownerBased(partySchema);
commonIndexes.publicContent(partySchema);
commonIndexes.temporal(partySchema);

// Party-specific indexes
partySchema.index({ name: 'text', description: 'text' });
partySchema.index({ tags: 1 });
partySchema.index({ 'settings.allowJoining': 1 });
partySchema.index({ lastActivity: -1 });

// Create and export the model
export const Party = mongoose.model<IParty, PartyModel>('Party', partySchema);