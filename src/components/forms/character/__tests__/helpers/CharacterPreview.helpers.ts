/**
 * Test helpers for CharacterPreview component tests
 */

export const defaultCharacterPreviewProps = {
  basicInfo: {
    name: 'Aragorn',
    type: 'pc' as const,
    race: 'human',
  },
  abilityScores: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 12,
    wisdom: 13,
    charisma: 11,
  },
  classes: [
    { className: 'ranger', level: 5 },
  ],
  combatStats: {
    hitPoints: {
      maximum: 45,
      current: 45,
      temporary: 0,
    },
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 3,
  },
  isValid: true,
};

export const createCharacterPreviewProps = (overrides: any = {}) => ({
  ...defaultCharacterPreviewProps,
  ...overrides,
});