import type { ICharacter } from '@/lib/models/Character';

// Define skill-to-ability mappings
export const SKILL_ABILITIES: Record<string, keyof ICharacter['abilityScores']> = {
  'Athletics': 'strength',
  'Acrobatics': 'dexterity',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Arcana': 'intelligence',
  'History': 'intelligence',
  'Investigation': 'intelligence',
  'Nature': 'intelligence',
  'Religion': 'intelligence',
  'Animal Handling': 'wisdom',
  'Insight': 'wisdom',
  'Medicine': 'wisdom',
  'Perception': 'wisdom',
  'Survival': 'wisdom',
  'Deception': 'charisma',
  'Intimidation': 'charisma',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
};

export const getAbilityModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export const getAbilityScoreDisplay = (score: number): string => {
  return `${score} (${getAbilityModifier(score)})`;
};

const isProficientInSavingThrow = (character: ICharacter, ability: string): boolean => {
  return character.savingThrows instanceof Map
    ? character.savingThrows.get(ability) || false
    : character.savingThrows?.[ability as keyof typeof character.savingThrows] || false;
};

export const getSavingThrowBonus = (character: ICharacter, ability: string, score: number): number => {
  const modifier = Math.floor((score - 10) / 2);
  const isProficient = isProficientInSavingThrow(character, ability);
  return isProficient ? modifier + character.proficiencyBonus : modifier;
};

const isProficientInSkill = (character: ICharacter, skillName: string): boolean => {
  return character.skills instanceof Map
    ? character.skills.get(skillName) || false
    : character.skills?.[skillName] || false;
};

export const getSkillBonus = (character: ICharacter, skillName: string, abilityScore: number): number => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  const isProficient = isProficientInSkill(character, skillName);
  return isProficient ? modifier + character.proficiencyBonus : modifier;
};

export const formatBonus = (bonus: number): string => {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
};

export const getOrdinalSuffix = (num: number): string => {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  // Handle special cases for 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  // Handle regular cases
  const suffixes = ['th', 'st', 'nd', 'rd'];
  return suffixes[lastDigit] || 'th';
};

// Utility for extracting skill entries from character
export const getSkillEntries = (character: ICharacter) => {
  if (!character.skills) return [];

  return character.skills instanceof Map
    ? Array.from(character.skills.entries())
    : Object.entries(character.skills);
};

// Utility to check if character has any skills
export const hasAnySkills = (character: ICharacter): boolean => {
  if (!character.skills) return false;

  return character.skills instanceof Map
    ? character.skills.size > 0
    : Object.keys(character.skills).length > 0;
};