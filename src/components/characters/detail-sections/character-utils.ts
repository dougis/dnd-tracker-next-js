import type { ICharacter } from '@/lib/models/Character';

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