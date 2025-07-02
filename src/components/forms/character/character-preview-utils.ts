// Utility functions for character preview calculations and formatting

interface BasicInfoData {
  name: string;
  type: 'pc' | 'npc';
  race: string;
  customRace?: string;
}

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface ClassData {
  className: string;
  level: number;
}

interface CombatStatsData {
  hitPoints: {
    maximum: number;
    current: number;
    temporary?: number;
  };
  armorClass: number;
  speed?: number;
  proficiencyBonus?: number;
}

/**
 * Calculate ability score modifier
 */
export const calculateModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `(+${modifier})` : `(${modifier})`;
};

/**
 * Calculate raw ability score modifier (just the number)
 */
export const calculateRawModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Format race display name
 */
export const formatRace = (race: string, customRace?: string): string => {
  if (race === 'custom' && customRace) {
    return customRace;
  }
  return race.charAt(0).toUpperCase() + race.slice(1).replace('-', ' ');
};

/**
 * Format class name with capitalization
 */
export const formatClassName = (className: string): string => {
  return className.charAt(0).toUpperCase() + className.slice(1);
};

/**
 * Calculate total character level
 */
export const calculateTotalLevel = (classes: ClassData[]): number => {
  return classes.reduce((sum, cls) => sum + cls.level, 0);
};

/**
 * Format hit points display
 */
export const formatHitPoints = (hitPoints: CombatStatsData['hitPoints']): string => {
  const { current, maximum, temporary } = hitPoints;
  const base = `${current}/${maximum}`;
  return temporary && temporary > 0 ? `${base} (+${temporary})` : base;
};

/**
 * Check if basic info is complete
 */
export const hasCompleteBasicInfo = (basicInfo: BasicInfoData): boolean => {
  return !!(basicInfo.name && basicInfo.type && basicInfo.race);
};

/**
 * Check if custom race is valid when required
 */
export const hasValidCustomRace = (basicInfo: BasicInfoData): boolean => {
  return basicInfo.race !== 'custom' || !!basicInfo.customRace?.trim();
};

/**
 * Check if ability scores are valid
 */
export const hasValidAbilityScores = (abilityScores: AbilityScores): boolean => {
  return Object.values(abilityScores).every(score => score >= 1 && score <= 30);
};

/**
 * Check if classes are valid
 */
export const hasValidClasses = (classes: ClassData[]): boolean => {
  return classes.length > 0 && classes.every(cls => cls.level >= 1);
};

/**
 * Check if combat stats are valid
 */
export const hasValidCombatStats = (combatStats: CombatStatsData): boolean => {
  return combatStats.hitPoints.maximum > 0 && combatStats.armorClass > 0;
};

/**
 * Get completion sections for form validation display
 */
export const getCompletionSections = (
  basicInfo: BasicInfoData,
  abilityScores: AbilityScores,
  classes: ClassData[],
  combatStats: CombatStatsData
) => {
  return [
    { name: 'Basic Info', completed: hasCompleteBasicInfo(basicInfo) && hasValidCustomRace(basicInfo) },
    { name: 'Ability Scores', completed: hasValidAbilityScores(abilityScores) },
    { name: 'Classes', completed: hasValidClasses(classes) },
    { name: 'Combat Stats', completed: hasValidCombatStats(combatStats) },
  ];
};