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

// Helper functions to create invalid scenarios
export const createInvalidBasicInfoProps = (invalidField: string, value?: any) => ({
  ...defaultCharacterPreviewProps,
  basicInfo: { ...defaultCharacterPreviewProps.basicInfo, [invalidField]: value ?? '' },
  isValid: false,
});

export const createInvalidAbilityScoresProps = (scoreOverrides: Record<string, number>) => ({
  ...defaultCharacterPreviewProps,
  abilityScores: { ...defaultCharacterPreviewProps.abilityScores, ...scoreOverrides },
  isValid: false,
});

export const createInvalidClassesProps = (classes: any[]) => ({
  ...defaultCharacterPreviewProps,
  classes,
  isValid: false,
});

export const createInvalidCombatStatsProps = (combatStatsOverrides: any) => ({
  ...defaultCharacterPreviewProps,
  combatStats: { ...defaultCharacterPreviewProps.combatStats, ...combatStatsOverrides },
  isValid: false,
});

// Helper functions for specific class test scenarios
export const createMulticlassProps = (classes: Array<{ className: string; level: number }>) => ({
  ...defaultCharacterPreviewProps,
  classes,
});

export const createSingleClassProps = (className: string, level: number) => ({
  ...defaultCharacterPreviewProps,
  classes: [{ className, level }],
});

// Helper for simple invalid props
export const createInvalidProps = () => ({
  ...defaultCharacterPreviewProps,
  isValid: false,
});