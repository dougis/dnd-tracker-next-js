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

export const getSavingThrowBonus = (character: ICharacter, ability: string, score: number): number => {
  const modifier = Math.floor((score - 10) / 2);
  // Handle both Map and object for savingThrows
  const isProficient = character.savingThrows instanceof Map
    ? character.savingThrows.get(ability)
    : character.savingThrows?.[ability as keyof typeof character.savingThrows] || false;
  return isProficient ? modifier + character.proficiencyBonus : modifier;
};

export const getSkillBonus = (character: ICharacter, skillName: string, abilityScore: number): number => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  // Handle both Map and object for skills
  const isProficient = character.skills instanceof Map
    ? character.skills.get(skillName)
    : character.skills?.[skillName] || false;
  return isProficient ? modifier + character.proficiencyBonus : modifier;
};

export const formatBonus = (bonus: number): string => {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
};

export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};