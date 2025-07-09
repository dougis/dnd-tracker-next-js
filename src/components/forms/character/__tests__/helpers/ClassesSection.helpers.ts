/**
 * Test helpers for ClassesSection component tests
 */

// Common class data for tests
export const createClassData = (className: string, level: number = 1) => {
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

  return {
    class: className as any,
    level,
    hitDie: hitDieMap[className] || 8,
  };
};

// Common class configurations
export const singleFighter = () => [createClassData('fighter', 1)];
export const fighterRogue = () => [createClassData('fighter', 3), createClassData('rogue', 2)];
export const threeClassBuild = () => [
  createClassData('fighter', 1),
  createClassData('rogue', 1),
  createClassData('wizard', 1),
];

// Helper to create props with specific class configurations
export const createClassesSectionProps = (
  classes = singleFighter(),
  errors = {},
  onChange = jest.fn()
) => ({
  value: classes,
  onChange,
  errors,
});