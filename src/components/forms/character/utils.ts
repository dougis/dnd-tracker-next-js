// Shared utilities for character forms

import { CharacterClass, CharacterCreation } from '@/lib/validations/character';

// Helper function to get hit die for each class
export const getHitDieForClass = (className: CharacterClass): number => {
  const hitDieMap: Record<string, number> = {
    'barbarian': 12,
    'fighter': 10,
    'paladin': 10,
    'ranger': 10,
    'bard': 8,
    'cleric': 8,
    'druid': 8,
    'monk': 8,
    'rogue': 8,
    'warlock': 8,
    'artificer': 8,
    'sorcerer': 6,
    'wizard': 6,
  };
  return hitDieMap[className] || 8;
};

// Calculate modifier for an ability score
export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Format modifier with + or - sign
export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Transform CharacterCreation to CharacterPreview format
export const transformToPreviewFormat = (formValues: CharacterCreation) => ({
  basicInfo: {
    name: formValues.name || '',
    type: formValues.type || 'pc',
    race: formValues.race || 'human',
    customRace: formValues.customRace,
  },
  abilityScores: formValues.abilityScores || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  classes: formValues.classes?.map(cls => ({
    className: cls.class,
    level: cls.level,
  })) || [{ className: 'fighter', level: 1 }],
  combatStats: {
    hitPoints: formValues.hitPoints || { maximum: 10, current: 10, temporary: 0 },
    armorClass: formValues.armorClass || 10,
    speed: formValues.speed,
    proficiencyBonus: formValues.proficiencyBonus,
  },
});