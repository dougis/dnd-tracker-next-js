
import { Types } from 'mongoose';
import { z } from 'zod';
import {
  encounterStatusSchema,
  encounterDifficultySchema,
} from '../../validations/encounter';
import { IEncounter, CreateEncounterInput } from './interfaces';
import { createDefaultEncounterSettings } from './utils';

/**
 * Static methods for the Encounter model
 */

/* eslint-disable no-unused-vars */


export function findByOwnerId(
  this: any,
  ownerId: Types.ObjectId,
  includeShared = false
): Promise<IEncounter[]> {
  const query: any = includeShared
    ? { $or: [{ ownerId }, { sharedWith: ownerId }] }
    : { ownerId };

  return this.find(query).sort({ updatedAt: -1 });
}


export function findByStatus(
  this: any,
  status: z.infer<typeof encounterStatusSchema>
): Promise<IEncounter[]> {
  return this.find({ status }).sort({ updatedAt: -1 });
}

// eslint-disable-next-line no-unused-vars
export function findPublic(this: any): Promise<IEncounter[]> {
  return this.find({ isPublic: true }).sort({ updatedAt: -1 });
}


export function searchByName(
  this: any,
  searchTerm: string
): Promise<IEncounter[]> {
  return this.find({
    $text: { $search: searchTerm },
  }).sort({ score: { $meta: 'textScore' } });
}


export function findByDifficulty(
  this: any,
  difficulty: z.infer<typeof encounterDifficultySchema>
): Promise<IEncounter[]> {
  return this.find({ difficulty }).sort({ updatedAt: -1 });
}


export function findByTargetLevel(
  this: any,
  level: number
): Promise<IEncounter[]> {
  return this.find({ targetLevel: level }).sort({ updatedAt: -1 });
}

// eslint-disable-next-line no-unused-vars
export function findActive(this: any): Promise<IEncounter[]> {
  return this.find({ 'combatState.isActive': true }).sort({
    'combatState.startedAt': -1,
  });
}


export async function createEncounter(
  this: any,
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
      ...createDefaultEncounterSettings(),
      ...encounterData.settings,
    },
    partyId: encounterData.partyId
      ? new Types.ObjectId(encounterData.partyId)
      : undefined,
    isPublic: encounterData.isPublic || false,
  });

  await encounter.save();
  return encounter;
}
