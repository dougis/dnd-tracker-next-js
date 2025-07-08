/**
 * Types and interfaces for encounter import/export functionality
 */

import { z } from 'zod';

/**
 * Export formats supported by the import/export system
 */
export type ExportFormat = 'json' | 'xml';

/**
 * Export options for customizing export behavior
 */
export interface ExportOptions {
  includeCharacterSheets?: boolean;
  includePrivateNotes?: boolean;
  includeIds?: boolean;
  stripPersonalData?: boolean;
}

/**
 * Import options for customizing import behavior
 */
export interface ImportOptions {
  ownerId: string;
  preserveIds?: boolean;
  createMissingCharacters?: boolean;
  overwriteExisting?: boolean;
}

/**
 * Comprehensive encounter export data structure
 */
export interface EncounterExportData {
  metadata: {
    exportedAt: string;
    exportedBy: string;
    format: ExportFormat;
    version: string;
    appVersion: string;
  };
  encounter: {
    name: string;
    description: string;
    tags: string[];
    difficulty?: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
    estimatedDuration?: number;
    targetLevel?: number;
    status: 'draft' | 'active' | 'completed' | 'archived';
    isPublic: boolean;
    settings: {
      allowPlayerVisibility: boolean;
      autoRollInitiative: boolean;
      trackResources: boolean;
      enableLairActions: boolean;
      lairActionInitiative?: number;
      enableGridMovement: boolean;
      gridSize: number;
      roundTimeLimit?: number;
      experienceThreshold?: number;
    };
    combatState?: {
      isActive: boolean;
      currentRound: number;
      currentTurn: number;
      totalDuration: number;
      startedAt?: string;
      pausedAt?: string;
      endedAt?: string;
      initiativeOrder: Array<{
        participantId: string;
        initiative: number;
        dexterity: number;
        isActive: boolean;
        hasActed: boolean;
        isDelayed?: boolean;
        readyAction?: string;
      }>;
    };
    participants: Array<{
      id: string;
      name: string;
      type: 'pc' | 'npc' | 'monster';
      maxHitPoints: number;
      currentHitPoints: number;
      temporaryHitPoints: number;
      armorClass: number;
      initiative?: number;
      isPlayer: boolean;
      isVisible: boolean;
      notes: string;
      conditions: string[];
      position?: { x: number; y: number };
    }>;
    characterSheets?: Array<{
      id: string;
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
      skills: Record<string, boolean>;
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
    }>;
  };
}

/**
 * Schema for validating encounter export data
 */
export const encounterExportSchema = z.object({
  metadata: z.object({
    exportedAt: z.string(),
    exportedBy: z.string(),
    format: z.enum(['json', 'xml']),
    version: z.string(),
    appVersion: z.string(),
  }),
  encounter: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000),
    tags: z.array(z.string().max(30)).max(10),
    difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'deadly']).optional(),
    estimatedDuration: z.number().min(1).max(480).optional(),
    targetLevel: z.number().min(1).max(20).optional(),
    status: z.enum(['draft', 'active', 'completed', 'archived']),
    isPublic: z.boolean(),
    settings: z.object({
      allowPlayerVisibility: z.boolean(),
      autoRollInitiative: z.boolean(),
      trackResources: z.boolean(),
      enableLairActions: z.boolean(),
      lairActionInitiative: z.number().min(1).max(30).optional(),
      enableGridMovement: z.boolean(),
      gridSize: z.number().min(1).max(50),
      roundTimeLimit: z.number().min(30).max(600).optional(),
      experienceThreshold: z.number().min(0).max(30).optional(),
    }),
    combatState: z.object({
      isActive: z.boolean(),
      currentRound: z.number().min(0),
      currentTurn: z.number().min(0),
      totalDuration: z.number().min(0),
      startedAt: z.string().optional(),
      pausedAt: z.string().optional(),
      endedAt: z.string().optional(),
      initiativeOrder: z.array(z.object({
        participantId: z.string(),
        initiative: z.number().min(1).max(30),
        dexterity: z.number().min(1).max(30),
        isActive: z.boolean(),
        hasActed: z.boolean(),
        isDelayed: z.boolean().optional(),
        readyAction: z.string().optional(),
      })),
    }).optional(),
    participants: z.array(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      type: z.enum(['pc', 'npc', 'monster']),
      maxHitPoints: z.number().min(1).max(999),
      currentHitPoints: z.number().min(-999).max(999),
      temporaryHitPoints: z.number().min(0).max(999),
      armorClass: z.number().min(1).max(30),
      initiative: z.number().min(1).max(30).optional(),
      isPlayer: z.boolean(),
      isVisible: z.boolean(),
      notes: z.string().max(500),
      conditions: z.array(z.string().max(50)).max(20),
      position: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
      }).optional(),
    })).max(50),
    characterSheets: z.array(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      type: z.enum(['pc', 'npc']),
      race: z.string().min(1).max(50),
      customRace: z.string().max(50).optional(),
      size: z.enum(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']),
      classes: z.array(z.object({
        class: z.string().min(1).max(50),
        level: z.number().min(1).max(20),
        subclass: z.string().max(50).optional(),
        hitDie: z.number().min(4).max(12),
      })).min(1).max(5),
      abilityScores: z.object({
        strength: z.number().min(1).max(30),
        dexterity: z.number().min(1).max(30),
        constitution: z.number().min(1).max(30),
        intelligence: z.number().min(1).max(30),
        wisdom: z.number().min(1).max(30),
        charisma: z.number().min(1).max(30),
      }),
      hitPoints: z.object({
        maximum: z.number().min(1).max(999),
        current: z.number().min(-999).max(999),
        temporary: z.number().min(0).max(999),
      }),
      armorClass: z.number().min(1).max(30),
      speed: z.number().min(0).max(200),
      proficiencyBonus: z.number().min(2).max(6),
      savingThrows: z.object({
        strength: z.boolean(),
        dexterity: z.boolean(),
        constitution: z.boolean(),
        intelligence: z.boolean(),
        wisdom: z.boolean(),
        charisma: z.boolean(),
      }),
      skills: z.record(z.string(), z.boolean()),
      equipment: z.array(z.object({
        name: z.string().min(1).max(100),
        quantity: z.number().min(0).max(999),
        weight: z.number().min(0).max(999),
        value: z.number().min(0).max(999999),
        description: z.string().max(500).optional(),
        equipped: z.boolean(),
        magical: z.boolean(),
      })).max(200),
      spells: z.array(z.object({
        name: z.string().min(1).max(100),
        level: z.number().min(0).max(9),
        school: z.string().min(1).max(50),
        castingTime: z.string().min(1).max(100),
        range: z.string().min(1).max(100),
        components: z.string().min(1).max(100),
        duration: z.string().min(1).max(100),
        description: z.string().min(1).max(2000),
        isPrepared: z.boolean(),
      })).max(500),
      backstory: z.string().max(10000),
      notes: z.string().max(2000),
      imageUrl: z.string().url().optional(),
    })).optional(),
  }),
});