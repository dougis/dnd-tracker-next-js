import { z } from 'zod';

// NPC-specific creature types
export const CreatureTypeSchema = z.enum([
  'aberration',
  'beast',
  'celestial',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'fiend',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead'
]);

// NPC sizes
export const SizeSchema = z.enum([
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan'
]);

// Challenge Rating values
export const ChallengeRatingSchema = z.union([
  z.literal(0),
  z.literal(0.125),
  z.literal(0.25),
  z.literal(0.5),
  z.number().int().min(1).max(30)
]);

// NPC Ability Scores
export const NPCAbilityScoresSchema = z.object({
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
});

// NPC Hit Points
export const NPCHitPointsSchema = z.object({
  maximum: z.number().int().min(1),
  current: z.number().int().min(0),
  temporary: z.number().int().min(0).optional().default(0),
  hitDice: z.string().optional(), // e.g., "2d8+2"
});

// NPC Stats
export const NPCStatsSchema = z.object({
  abilityScores: NPCAbilityScoresSchema,
  hitPoints: NPCHitPointsSchema,
  armorClass: z.number().int().min(1).max(30),
  speed: z.number().int().min(0).default(30),
  proficiencyBonus: z.number().int().min(0).optional(),
  savingThrows: z.record(z.string(), z.number().int()).optional(),
  skills: z.record(z.string(), z.number().int()).optional(),
  damageVulnerabilities: z.array(z.string()).optional().default([]),
  damageResistances: z.array(z.string()).optional().default([]),
  damageImmunities: z.array(z.string()).optional().default([]),
  conditionImmunities: z.array(z.string()).optional().default([]),
  senses: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
});

// NPC Equipment Item
export const NPCEquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  quantity: z.number().int().min(1).optional().default(1),
  description: z.string().optional(),
  type: z.enum(['weapon', 'armor', 'tool', 'misc']).optional(),
  magical: z.boolean().optional().default(false),
});

// NPC Spell
export const NPCSpellSchema = z.object({
  name: z.string().min(1, 'Spell name is required'),
  level: z.number().int().min(0).max(9),
  school: z.string().optional(),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  components: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  usesRemaining: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(0).optional(),
});

// NPC Actions
export const NPCActionSchema = z.object({
  name: z.string().min(1, 'Action name is required'),
  type: z.enum(['action', 'bonus_action', 'reaction', 'legendary_action', 'lair_action']),
  description: z.string().min(1, 'Action description is required'),
  attackBonus: z.number().int().optional(),
  damage: z.string().optional(), // e.g., "1d8+3 slashing"
  savingThrow: z.object({
    ability: z.string(),
    dc: z.number().int().min(1).max(30),
  }).optional(),
  range: z.string().optional(),
  recharge: z.string().optional(), // e.g., "5-6" for recharge on 5 or 6
  uses: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(0).optional(),
});

// NPC Behavior notes
export const NPCBehaviorSchema = z.object({
  personality: z.string().optional(),
  motivations: z.string().optional(),
  tactics: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  notes: z.string().optional(),
});

// NPC Template Schema
export const NPCTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Template name is required'),
  category: CreatureTypeSchema,
  challengeRating: ChallengeRatingSchema,
  size: SizeSchema.optional().default('medium'),
  stats: NPCStatsSchema,
  equipment: z.array(NPCEquipmentSchema).optional().default([]),
  spells: z.array(NPCSpellSchema).optional().default([]),
  actions: z.array(NPCActionSchema).optional().default([]),
  behavior: NPCBehaviorSchema.optional(),
  isSystem: z.boolean().optional().default(false), // True for built-in templates
  createdBy: z.string().optional(), // User ID for custom templates
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// NPC Creation Schema (extends Character)
export const NPCCreationSchema = z.object({
  name: z.string().min(2, 'NPC name must be at least 2 characters').max(100, 'NPC name must be less than 100 characters'),
  type: z.literal('npc'),
  creatureType: CreatureTypeSchema,
  size: SizeSchema.optional().default('medium'),
  challengeRating: ChallengeRatingSchema,
  abilityScores: NPCAbilityScoresSchema,
  hitPoints: NPCHitPointsSchema,
  armorClass: z.number().int().min(1).max(30),
  speed: z.number().int().min(0).default(30),
  proficiencyBonus: z.number().int().min(0).optional(),
  savingThrows: z.record(z.string(), z.number().int()).optional(),
  skills: z.record(z.string(), z.number().int()).optional(),
  damageVulnerabilities: z.array(z.string()).optional().default([]),
  damageResistances: z.array(z.string()).optional().default([]),
  damageImmunities: z.array(z.string()).optional().default([]),
  conditionImmunities: z.array(z.string()).optional().default([]),
  senses: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  equipment: z.array(NPCEquipmentSchema).optional().default([]),
  spells: z.array(NPCSpellSchema).optional().default([]),
  actions: z.array(NPCActionSchema).optional().default([]),
  behavior: NPCBehaviorSchema.optional(),
  isSpellcaster: z.boolean().optional().default(false),
  spellcastingAbility: z.enum(['intelligence', 'wisdom', 'charisma']).optional(),
  spellSaveDC: z.number().int().min(1).max(30).optional(),
  spellAttackBonus: z.number().int().optional(),
  // Variant fields
  isVariant: z.boolean().optional().default(false),
  baseTemplateId: z.string().optional(),
  variantType: z.enum(['elite', 'weak', 'champion', 'minion']).optional(),
});

// Variant modifier types
export const VariantTypeSchema = z.enum(['elite', 'weak', 'champion', 'minion']);

// Import format types
export const ImportFormatSchema = z.enum(['json', 'dndbeyond', 'roll20', 'custom']);

// Filter options for templates
export const TemplateFilterSchema = z.object({
  category: CreatureTypeSchema.optional(),
  minCR: ChallengeRatingSchema.optional(),
  maxCR: ChallengeRatingSchema.optional(),
  search: z.string().optional(),
  size: SizeSchema.optional(),
  isSystem: z.boolean().optional(),
});

// Type exports
export type CreatureType = z.infer<typeof CreatureTypeSchema>;
export type Size = z.infer<typeof SizeSchema>;
export type ChallengeRating = z.infer<typeof ChallengeRatingSchema>;
export type NPCAbilityScores = z.infer<typeof NPCAbilityScoresSchema>;
export type NPCHitPoints = z.infer<typeof NPCHitPointsSchema>;
export type NPCStats = z.infer<typeof NPCStatsSchema>;
export type NPCEquipment = z.infer<typeof NPCEquipmentSchema>;
export type NPCSpell = z.infer<typeof NPCSpellSchema>;
export type NPCAction = z.infer<typeof NPCActionSchema>;
export type NPCBehavior = z.infer<typeof NPCBehaviorSchema>;
export type NPCTemplate = z.infer<typeof NPCTemplateSchema>;
export type NPCCreationData = z.infer<typeof NPCCreationSchema>;
export type VariantType = z.infer<typeof VariantTypeSchema>;
export type ImportFormat = z.infer<typeof ImportFormatSchema>;
export type TemplateFilter = z.infer<typeof TemplateFilterSchema>;

// Utility functions
export function calculateProficiencyBonus(challengeRating: ChallengeRating): number {
  if (challengeRating <= 4) return 2;
  if (challengeRating <= 8) return 3;
  if (challengeRating <= 12) return 4;
  if (challengeRating <= 16) return 5;
  if (challengeRating <= 20) return 6;
  if (challengeRating <= 24) return 7;
  if (challengeRating <= 28) return 8;
  return 9;
}

export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatChallengeRating(cr: ChallengeRating): string {
  if (cr === 0) return '0';
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return cr.toString();
}

export function parseChallengeRating(crString: string): ChallengeRating {
  const crMap: Record<string, ChallengeRating> = {
    '0': 0,
    '1/8': 0.125,
    '1/4': 0.25,
    '1/2': 0.5,
  };

  const normalized = crString.toLowerCase();
  if (normalized in crMap) {
    return crMap[normalized];
  }

  const parsed = parseInt(crString, 10);
  if (parsed >= 1 && parsed <= 30) return parsed;
  throw new Error(`Invalid challenge rating: ${crString}`);
}