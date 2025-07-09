import type { ICharacter } from '@/lib/models/Character';
import type { ParticipantFormData } from '../hooks/useParticipantForm';

/**
 * Converts a character document to participant form data
 * This utility handles the data transformation between character library and encounter participants
 */
export function convertCharacterToParticipant(character: ICharacter): ParticipantFormData {
  return {
    characterId: character._id.toString(),
    name: character.name,
    type: character.type,
    maxHitPoints: character.hitPoints.max,
    currentHitPoints: character.hitPoints.current,
    temporaryHitPoints: character.hitPoints.temporary || 0,
    armorClass: character.armorClass,
    initiative: undefined, // Will be rolled during encounter
    isPlayer: character.type === 'pc',
    isVisible: true,
    notes: character.notes || '',
    conditions: [],
    position: undefined, // Will be set during encounter if grid is enabled
  };
}

/**
 * Converts multiple characters to participant form data
 */
export function convertCharactersToParticipants(characters: ICharacter[]): ParticipantFormData[] {
  return characters.map(convertCharacterToParticipant);
}

/**
 * Validates that a character can be converted to a participant
 */
export function validateCharacterForConversion(character: ICharacter): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!character.name?.trim()) {
    errors.push('Character name is required');
  }

  if (!character.type) {
    errors.push('Character type is required');
  }

  if (!character.hitPoints?.max || character.hitPoints.max <= 0) {
    errors.push('Character must have valid hit points');
  }

  if (!character.armorClass || character.armorClass <= 0) {
    errors.push('Character must have valid armor class');
  }

  // Check ability scores
  if (!character.abilityScores) {
    errors.push('Character must have ability scores');
  } else {
    const requiredAbilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const ability of requiredAbilities) {
      if (!character.abilityScores[ability as keyof typeof character.abilityScores] || 
          character.abilityScores[ability as keyof typeof character.abilityScores] <= 0) {
        errors.push(`Character must have valid ${ability} score`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple characters for conversion
 */
export function validateCharactersForConversion(characters: ICharacter[]): {
  validCharacters: ICharacter[];
  invalidCharacters: { character: ICharacter; errors: string[] }[];
} {
  const validCharacters: ICharacter[] = [];
  const invalidCharacters: { character: ICharacter; errors: string[] }[] = [];

  for (const character of characters) {
    const validation = validateCharacterForConversion(character);
    if (validation.isValid) {
      validCharacters.push(character);
    } else {
      invalidCharacters.push({ character, errors: validation.errors });
    }
  }

  return { validCharacters, invalidCharacters };
}