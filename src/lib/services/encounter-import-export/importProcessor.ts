/**
 * Import processing utilities for encounter import/export
 */

import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from '../UserServiceErrors';
import { handleEncounterServiceError } from '../EncounterServiceErrors';
import { Character } from '@/lib/models/Character';
import { Encounter } from '@/lib/models/encounter';
import { Types } from 'mongoose';
import { z } from 'zod';

import type { ImportOptions } from './types';
import { encounterExportSchema } from './types';

/**
 * Process imported encounter data and create encounter
 */
export async function processImportData(
  importData: z.infer<typeof encounterExportSchema>,
  options: ImportOptions
): Promise<ServiceResult<IEncounter>> {
  try {
    const encounterData = importData.encounter;

    // Handle character creation if needed
    const participantMap = await createMissingCharacters(encounterData, options);

    // Create encounter with processed data
    const newEncounter = await createEncounterFromImport(encounterData, participantMap, options);

    return {
      success: true,
      data: newEncounter,
    };
  } catch (error) {
    return handleEncounterServiceError(
      error,
      'Failed to process import data',
      'ENCOUNTER_IMPORT_DATA_PROCESSING_FAILED'
    );
  }
}

/**
 * Create missing characters from character sheets
 */
async function createMissingCharacters(
  encounterData: z.infer<typeof encounterExportSchema>['encounter'],
  options: ImportOptions
): Promise<Map<string, Types.ObjectId>> {
  const participantMap = new Map<string, Types.ObjectId>();

  if (options.createMissingCharacters && encounterData.characterSheets) {
    for (const charSheet of encounterData.characterSheets) {
      const character = await createCharacterFromSheet(charSheet, options.ownerId);
      participantMap.set(charSheet.id, character._id);
    }
  }

  return participantMap;
}

/**
 * Create a character from character sheet data
 */
async function createCharacterFromSheet(charSheet: any, ownerId: string) {
  const character = new Character({
    ownerId: new Types.ObjectId(ownerId),
    name: charSheet.name,
    type: charSheet.type,
    race: charSheet.race,
    customRace: charSheet.customRace,
    size: charSheet.size,
    classes: charSheet.classes,
    abilityScores: charSheet.abilityScores,
    hitPoints: charSheet.hitPoints,
    armorClass: charSheet.armorClass,
    speed: charSheet.speed,
    proficiencyBonus: charSheet.proficiencyBonus,
    savingThrows: charSheet.savingThrows,
    skills: new Map(Object.entries(charSheet.skills)),
    equipment: charSheet.equipment,
    spells: charSheet.spells,
    backstory: charSheet.backstory,
    notes: charSheet.notes,
    imageUrl: charSheet.imageUrl,
    isPublic: false,
  });

  await character.save();
  return character;
}

/**
 * Create encounter from import data
 */
async function createEncounterFromImport(
  encounterData: z.infer<typeof encounterExportSchema>['encounter'],
  participantMap: Map<string, Types.ObjectId>,
  options: ImportOptions
): Promise<IEncounter> {
  const createEncounterInput = {
    ownerId: options.ownerId,
    name: encounterData.name,
    description: encounterData.description,
    tags: encounterData.tags,
    difficulty: encounterData.difficulty,
    estimatedDuration: encounterData.estimatedDuration,
    targetLevel: encounterData.targetLevel,
    participants: encounterData.participants.map(p => ({
      characterId: participantMap.get(p.id) || new Types.ObjectId(),
      name: p.name,
      type: p.type,
      maxHitPoints: p.maxHitPoints,
      currentHitPoints: p.currentHitPoints,
      temporaryHitPoints: p.temporaryHitPoints,
      armorClass: p.armorClass,
      initiative: p.initiative,
      isPlayer: p.isPlayer,
      isVisible: p.isVisible,
      notes: p.notes,
      conditions: p.conditions,
      position: p.position,
    })),
    settings: encounterData.settings,
    isPublic: encounterData.isPublic,
  };

  return await Encounter.create(createEncounterInput);
}