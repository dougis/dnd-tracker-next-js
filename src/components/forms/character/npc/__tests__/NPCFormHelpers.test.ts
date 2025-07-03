import { NPCFormHelpers } from '../NPCFormHelpers';
import { NPCTemplate } from '@/types/npc';

describe('NPCFormHelpers', () => {
  const mockTemplate: NPCTemplate = {
    id: 'test-1',
    name: 'Test Goblin',
    category: 'humanoid',
    challengeRating: 0.25,
    size: 'small',
    stats: {
      abilityScores: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8,
      },
      hitPoints: { maximum: 7, current: 7, temporary: 0 },
      armorClass: 15,
      speed: 30,
      proficiencyBonus: 2,
      savingThrows: {},
      skills: {},
      damageVulnerabilities: [],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: ['darkvision 60 ft.'],
      languages: ['Common', 'Goblin'],
    },
    equipment: [
      { name: 'Scimitar', type: 'weapon', quantity: 1, magical: false },
      { name: 'Shortbow', type: 'weapon', quantity: 1, magical: false },
    ],
    spells: [],
    actions: [
      {
        name: 'Scimitar',
        type: 'melee',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.',
        attackBonus: 4,
        damage: '1d6 + 2',
      },
    ],
    behavior: {
      personality: 'Cowardly but cunning',
      motivations: 'Survival and treasure',
      tactics: 'Hit and run attacks',
    },
    isSystem: true,
  };

  describe('templateToFormData', () => {
    it('converts template to form data correctly', () => {
      const result = NPCFormHelpers.templateToFormData(mockTemplate);

      expect(result.name).toBe('Test Goblin');
      expect(result.creatureType).toBe('humanoid');
      expect(result.size).toBe('small');
      expect(result.challengeRating).toBe(0.25);
      expect(result.abilityScores).toEqual(mockTemplate.stats.abilityScores);
      expect(result.hitPoints).toEqual({ ...mockTemplate.stats.hitPoints, temporary: 0 });
      expect(result.armorClass).toBe(15);
      expect(result.speed).toBe(30);
    });

    it('handles template without optional fields', () => {
      const minimalTemplate: NPCTemplate = {
        ...mockTemplate,
        equipment: undefined,
        spells: undefined,
        actions: undefined,
        behavior: undefined,
      };

      const result = NPCFormHelpers.templateToFormData(minimalTemplate);

      expect(result.equipment).toEqual([]);
      expect(result.spells).toEqual([]);
      expect(result.actions).toEqual([]);
      expect(result.personality).toBeUndefined();
      expect(result.motivations).toBeUndefined();
      expect(result.tactics).toBeUndefined();
    });

    it('sets isSpellcaster based on spells array', () => {
      const spellcasterTemplate: NPCTemplate = {
        ...mockTemplate,
        spells: [{ name: 'Magic Missile', level: 1 }],
      };

      const result = NPCFormHelpers.templateToFormData(spellcasterTemplate);
      expect(result.isSpellcaster).toBe(true);

      const nonSpellcasterResult = NPCFormHelpers.templateToFormData(mockTemplate);
      expect(nonSpellcasterResult.isSpellcaster).toBe(false);
    });

    it('copies array fields correctly', () => {
      const result = NPCFormHelpers.templateToFormData(mockTemplate);

      expect(result.damageVulnerabilities).toEqual([]);
      expect(result.damageResistances).toEqual([]);
      expect(result.damageImmunities).toEqual([]);
      expect(result.conditionImmunities).toEqual([]);
      expect(result.senses).toEqual(['darkvision 60 ft.']);
      expect(result.languages).toEqual(['Common', 'Goblin']);
    });
  });

  describe('jsonToFormData', () => {
    const currentFormData = {
      abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      hitPoints: { maximum: 10, current: 10, temporary: 0 },
    };

    it('converts JSON data to form data correctly', () => {
      const jsonData = {
        name: 'Imported NPC',
        creatureType: 'beast',
        challengeRating: 1,
        armorClass: 12,
        speed: 40,
      };

      const result = NPCFormHelpers.jsonToFormData(jsonData, currentFormData);

      expect(result.name).toBe('Imported NPC');
      expect(result.creatureType).toBe('beast');
      expect(result.challengeRating).toBe(1);
      expect(result.armorClass).toBe(12);
      expect(result.speed).toBe(40);
    });

    it('uses defaults for missing fields', () => {
      const jsonData = {};

      const result = NPCFormHelpers.jsonToFormData(jsonData, currentFormData);

      expect(result.name).toBe('');
      expect(result.creatureType).toBe('humanoid');
      expect(result.challengeRating).toBe(0.5);
      expect(result.armorClass).toBe(10);
      expect(result.speed).toBe(30);
    });

    it('preserves current form data for ability scores when not provided', () => {
      const jsonData = { name: 'Test' };

      const result = NPCFormHelpers.jsonToFormData(jsonData, currentFormData);

      expect(result.abilityScores).toBe(currentFormData.abilityScores);
    });

    it('handles hit points correctly', () => {
      const jsonDataWithHP = {
        hitPoints: { maximum: 20, current: 15, temporary: 5 },
      };

      const result = NPCFormHelpers.jsonToFormData(jsonDataWithHP, currentFormData);
      expect(result.hitPoints).toEqual({ maximum: 20, current: 15, temporary: 5 });

      const jsonDataWithoutHP = {};
      const resultWithoutHP = NPCFormHelpers.jsonToFormData(jsonDataWithoutHP, currentFormData);
      expect(resultWithoutHP.hitPoints).toBe(currentFormData.hitPoints);
    });
  });

  describe('filterTemplates', () => {
    const templates: NPCTemplate[] = [
      { ...mockTemplate, id: '1', name: 'Goblin Warrior', category: 'humanoid' },
      { ...mockTemplate, id: '2', name: 'Dire Wolf', category: 'beast' },
      { ...mockTemplate, id: '3', name: 'Fire Elemental', category: 'elemental' },
      { ...mockTemplate, id: '4', name: 'Goblin Shaman', category: 'humanoid' },
    ];

    it('filters by category correctly', () => {
      const result = NPCFormHelpers.filterTemplates(templates, '', 'humanoid');
      expect(result).toHaveLength(2);
      expect(result.every(t => t.category === 'humanoid')).toBe(true);
    });

    it('filters by search term correctly', () => {
      const result = NPCFormHelpers.filterTemplates(templates, 'goblin', 'all');
      expect(result).toHaveLength(2);
      expect(result.every(t => t.name.toLowerCase().includes('goblin'))).toBe(true);
    });

    it('filters by both category and search term', () => {
      const result = NPCFormHelpers.filterTemplates(templates, 'goblin', 'humanoid');
      expect(result).toHaveLength(2);
      expect(result.every(t => t.category === 'humanoid' && t.name.toLowerCase().includes('goblin'))).toBe(true);
    });

    it('returns all templates when no filters applied', () => {
      const result = NPCFormHelpers.filterTemplates(templates, '', 'all');
      expect(result).toHaveLength(4);
    });

    it('performs case-insensitive search', () => {
      const result = NPCFormHelpers.filterTemplates(templates, 'DIRE', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dire Wolf');
    });

    it('searches in category as well as name', () => {
      const result = NPCFormHelpers.filterTemplates(templates, 'beast', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('beast');
    });
  });
});