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
 * Hit points schema definition
 */
export const hitPointsSchema = {
  maximum: {
    type: Number,
    required: true,
    min: 1,
  },
  current: {
    type: Number,
    required: true,
    min: 0,
  },
  temporary: {
    type: Number,
    default: 0,
    min: 0,
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
 * Common field patterns for reuse
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
};