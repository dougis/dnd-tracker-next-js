/**
 * Test helper functions for NPCTemplateService tests
 * Reduces code duplication by centralizing test data creation
 */

import { NPCTemplate } from '@/types/npc';

/**
 * Create a basic valid template for testing
 */
export const createBaseTemplate = (overrides: Partial<Omit<NPCTemplate, 'id'>> = {}): Omit<NPCTemplate, 'id'> => ({
  name: 'Test Template',
  category: 'humanoid',
  challengeRating: 1,
  size: 'medium',
  stats: {
    abilityScores: {
      strength: 15,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 11,
      charisma: 10
    },
    hitPoints: { maximum: 12, current: 12, temporary: 0 },
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 2,
    savingThrows: {},
    skills: {},
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: [],
    languages: [],
  },
  equipment: [],
  spells: [],
  actions: [],
  isSystem: false,
  ...overrides
});

/**
 * Create a template with minimal required fields for validation tests
 */
export const createMinimalTemplate = (): Omit<NPCTemplate, 'id'> => ({
  name: 'Minimal',
  category: 'humanoid',
  challengeRating: 1,
  size: 'medium',
  stats: {
    abilityScores: {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    },
    hitPoints: { maximum: 1, current: 1, temporary: 0 },
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    savingThrows: {},
    skills: {},
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: [],
    languages: [],
  },
  equipment: [],
  spells: [],
  actions: [],
  isSystem: false
});

/**
 * Create template with equipment for testing
 */
export const createTemplateWithEquipment = (): Omit<NPCTemplate, 'id'> => createBaseTemplate({
  equipment: [
    { name: 'Chain mail', type: 'armor', quantity: 1, magical: false },
    { name: 'Shield', type: 'armor', quantity: 1, magical: false },
    { name: 'Longsword', type: 'weapon', quantity: 1, magical: false }
  ]
});

/**
 * Create template with behavior for testing
 */
export const createTemplateWithBehavior = (): Omit<NPCTemplate, 'id'> => createBaseTemplate({
  behavior: {
    personality: 'Disciplined and loyal',
    motivations: 'Protect the town', 
    tactics: 'Forms shield wall with allies'
  }
});

/**
 * Expect template to have required structure
 */
export const expectValidTemplateStructure = (template: NPCTemplate) => {
  expect(template).toHaveProperty('id');
  expect(template).toHaveProperty('name');
  expect(template).toHaveProperty('category');
  expect(template).toHaveProperty('challengeRating');
  expect(template).toHaveProperty('stats');
};

/**
 * Expect error result with specific code
 */
export const expectErrorWithCode = (result: any, code: string) => {
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(code);
};