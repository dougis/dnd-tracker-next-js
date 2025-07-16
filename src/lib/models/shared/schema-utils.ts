/**
 * Shared utilities for Mongoose schema definitions
 * Eliminates duplication across model files
 */

import mongoose from 'mongoose';

/**
 * Standard transform function for toJSON
 * Converts _id to id and removes __v field
 */
export const standardJSONTransform = {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

/**
 * Standard transform function for toObject
 * Converts _id to id and removes __v field
 */
export const standardObjectTransform = {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
};

/**
 * Complete schema options with standard transforms
 */
export const getStandardSchemaOptions = () => ({
  timestamps: true,
  toJSON: standardJSONTransform,
  toObject: standardObjectTransform,
});

/**
 * Ability score field definition for D&D 5e
 */
export const abilityScoreField = {
  type: Number,
  required: true,
  min: 1,
  max: 30,
};

/**
 * Saving throw field definition for D&D 5e
 */
export const savingThrowField = {
  type: Boolean,
  default: false,
};

/**
 * D&D 5e specific validation ranges
 */
export const DND_VALIDATION_RANGES = {
  ABILITY_SCORE: { min: 1, max: 30 },
  ARMOR_CLASS: { min: 1, max: 30 },
  INITIATIVE: { min: -10, max: 30 },
  CHARACTER_LEVEL: { min: 1, max: 20 },
  HIT_DIE: { min: 4, max: 12 },
  SPELL_LEVEL: { min: 0, max: 9 },
  HIT_POINTS: { min: 0 },
  HIT_POINTS_MAX: { min: 1 },
} as const;

/**
 * Hit points schema definition with validation
 */
export const hitPointsSchema = {
  maximum: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.HIT_POINTS_MAX,
  },
  current: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.HIT_POINTS,
    validate: {
      validator: function(this: any, value: number) {
        return value <= this.maximum;
      },
      message: 'Current HP cannot exceed maximum HP',
    },
  },
  temporary: {
    type: Number,
    default: 0,
    ...DND_VALIDATION_RANGES.HIT_POINTS,
  },
};

/**
 * Hit points interface for consistent typing
 */
export interface IHitPoints {
  maximum: number;
  current: number;
  temporary: number;
}

/**
 * Hit points management utilities
 */
export const hitPointsUtils = {

  /**
   * Calculate effective HP (current + temporary)
   */
  getEffectiveHP(hitPoints: IHitPoints): number {
    return hitPoints.current + hitPoints.temporary;
  },

  /**
   * Check if entity is alive
   */
  isAlive(hitPoints: IHitPoints): boolean {
    return hitPoints.current > 0;
  },

  /**
   * Check if entity is unconscious
   */
  isUnconscious(hitPoints: IHitPoints): boolean {
    return hitPoints.current <= 0;
  },

  /**
   * Apply damage to hit points
   */
  takeDamage(hitPoints: IHitPoints, damage: number): void {
    if (damage <= 0) return;

    // Apply damage to temporary HP first
    if (hitPoints.temporary > 0) {
      const tempDamage = Math.min(damage, hitPoints.temporary);
      hitPoints.temporary -= tempDamage;
      damage -= tempDamage;
    }

    // Apply remaining damage to current HP
    if (damage > 0) {
      hitPoints.current = Math.max(0, hitPoints.current - damage);
    }
  },

  /**
   * Heal hit points
   */
  heal(hitPoints: IHitPoints, healing: number): void {
    if (healing <= 0) return;
    hitPoints.current = Math.min(hitPoints.maximum, hitPoints.current + healing);
  },

  /**
   * Add temporary hit points
   */
  addTemporaryHP(hitPoints: IHitPoints, tempHP: number): void {
    if (tempHP <= 0) return;
    // Temporary HP doesn't stack, take the higher value
    hitPoints.temporary = Math.max(hitPoints.temporary, tempHP);
  },

  /**
   * Set maximum hit points and adjust current if necessary
   */
  setMaximumHP(hitPoints: IHitPoints, newMax: number): void {
    if (newMax <= 0) return;
    hitPoints.maximum = newMax;
    // Ensure current doesn't exceed new maximum
    if (hitPoints.current > newMax) {
      hitPoints.current = newMax;
    }
  },
};

/**
 * Standard MongoDB ObjectId reference field
 */
export const objectIdRef = (ref: string, required: boolean = true) => ({
  type: 'ObjectId',
  ref,
  required,
  index: true,
});

/**
 * Standard MongoDB ObjectId field (using mongoose Schema Types)
 */
export const mongooseObjectIdField = (ref: string, required: boolean = true, index: boolean = true) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref,
  required,
  index,
});

/**
 * Common field patterns for reuse across models
 */
export const commonFields = {
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500,
  },
  backstory: {
    type: String,
    default: '',
    maxlength: 5000,
  },
  shortDescription: {
    type: String,
    default: '',
    maxlength: 500,
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (tags: string[]) => tags.length <= 10,
      message: 'Cannot have more than 10 tags',
    },
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    // Note: Index is created by commonIndexes.temporal() with sparse: true
    // which is more appropriate for optional deletion timestamps
  },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: 500,
    validate: {
      validator: (url: string) => !url || /^https?:\/\/.+/.test(url),
      message: 'Image URL must be a valid HTTP/HTTPS URL',
    },
  },
  version: {
    type: Number,
    default: 1,
    min: 1,
  },
};

/**
 * D&D 5e specific field definitions
 */
export const dndFields = {
  armorClass: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.ARMOR_CLASS,
  },
  initiative: {
    type: Number,
    ...DND_VALIDATION_RANGES.INITIATIVE,
  },
  characterLevel: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.CHARACTER_LEVEL,
  },
  targetLevel: {
    type: Number,
    ...DND_VALIDATION_RANGES.CHARACTER_LEVEL,
    index: true,
  },
  hitDie: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.HIT_DIE,
  },
  spellLevel: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.SPELL_LEVEL,
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
};

/**
 * Common index patterns for reuse
 */
export const commonIndexes = {

  /**
   * Standard owner-based indexes
   */
  ownerBased: (schema: any) => {
    schema.index({ ownerId: 1, name: 1 });
    schema.index({ ownerId: 1, updatedAt: -1 });
    schema.index({ ownerId: 1, isDeleted: 1 });
  },

  /**
   * Public content indexes
   */
  publicContent: (schema: any) => {
    schema.index({ isPublic: 1, updatedAt: -1 });
    schema.index({ isPublic: 1, name: 1 });
  },

  /**
   * Temporal indexes for dates
   */
  temporal: (schema: any) => {
    schema.index({ createdAt: -1 });
    schema.index({ updatedAt: -1 });
    schema.index({ deletedAt: 1 }, { sparse: true });
  },

  /**
   * D&D specific indexes
   */
  dndContent: (schema: any) => {
    schema.index({ type: 1, isPublic: 1 });
    schema.index({ tags: 1 });
  },
};

/**
 * Common validation helpers
 */
export const validationHelpers = {

  /**
   * Validate D&D ability score (1-30)
   */
  isValidAbilityScore: (score: number): boolean => {
    return Number.isInteger(score) && score >= 1 && score <= 30;
  },

  /**
   * Calculate ability modifier from score
   */
  getAbilityModifier: (score: number): number => {
    return Math.floor((score - 10) / 2);
  },

  /**
   * Validate character level (1-20)
   */
  isValidCharacterLevel: (level: number): boolean => {
    return Number.isInteger(level) && level >= 1 && level <= 20;
  },

  /**
   * Validate armor class (1-30)
   */
  isValidArmorClass: (ac: number): boolean => {
    return Number.isInteger(ac) && ac >= 1 && ac <= 30;
  },

  /**
   * Validate initiative value (-10 to 30)
   */
  isValidInitiative: (initiative: number): boolean => {
    return Number.isInteger(initiative) && initiative >= -10 && initiative <= 30;
  },

  /**
   * Validate spell level (0-9)
   */
  isValidSpellLevel: (level: number): boolean => {
    return Number.isInteger(level) && level >= 0 && level <= 9;
  },

  /**
   * Validate hit die (4, 6, 8, 10, 12)
   */
  isValidHitDie: (die: number): boolean => {
    return [4, 6, 8, 10, 12].includes(die);
  },

  /**
   * Validate URL format
   */
  isValidUrl: (url: string): boolean => {
    if (!url) return true; // Allow empty URLs
    try {
      new URL(url);
      return /^https?:\/\/.+/.test(url);
    } catch {
      return false;
    }
  },

  /**
   * Validate tag array (max 10 tags, each max 30 chars)
   */
  isValidTagArray: (tags: string[]): boolean => {
    return (
      Array.isArray(tags) &&
      tags.length <= 10 &&
      tags.every(tag => typeof tag === 'string' && tag.length <= 30)
    );
  },
};