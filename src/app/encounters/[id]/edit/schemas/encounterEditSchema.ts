import { z } from 'zod';
import {
  encounterDifficultySchema,
  encounterSettingsSchema,
  participantReferenceSchema,
} from '@/lib/validations/encounter';

/**
 * Form-friendly schema that matches UpdateEncounter exactly
 * Extracted to reduce complexity in component files
 */
export const formEncounterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: encounterDifficultySchema.optional(),
  estimatedDuration: z.number().min(1, 'Duration must be positive').optional(),
  targetLevel: z.number().min(1, 'Level must be between 1 and 20').max(20, 'Level must be between 1 and 20').optional(),
  participants: z.array(participantReferenceSchema).optional(),
  settings: encounterSettingsSchema.optional(),
});

export type FormEncounterData = z.infer<typeof formEncounterSchema>;