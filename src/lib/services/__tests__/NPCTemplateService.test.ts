import { NPCTemplateService } from '../NPCTemplateService';
import { NPCTemplate } from '@/types/npc';

describe('NPCTemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('returns list of available NPC templates', async () => {
      const result = await NPCTemplateService.getTemplates();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data!.length).toBeGreaterThan(0);

      // Check template structure
      const template = result.data![0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('challengeRating');
      expect(template).toHaveProperty('stats');
    });

    it('filters templates by category', async () => {
      const result = await NPCTemplateService.getTemplates({ category: 'humanoid' });

      expect(result.success).toBe(true);
      result.data!.forEach(template => {
        expect(template.category).toBe('humanoid');
      });
    });

    it('filters templates by challenge rating range', async () => {
      const result = await NPCTemplateService.getTemplates({
        minCR: 0.5,
        maxCR: 2
      });

      expect(result.success).toBe(true);
      result.data!.forEach(template => {
        expect(template.challengeRating).toBeGreaterThanOrEqual(0.5);
        expect(template.challengeRating).toBeLessThanOrEqual(2);
      });
    });

    it('searches templates by name', async () => {
      const result = await NPCTemplateService.getTemplates({ search: 'guard' });

      expect(result.success).toBe(true);
      result.data!.forEach(template => {
        expect(template.name.toLowerCase()).toContain('guard');
      });
    });

    it('combines multiple filters', async () => {
      const result = await NPCTemplateService.getTemplates({
        category: 'humanoid',
        maxCR: 1,
        search: 'guard'
      });

      expect(result.success).toBe(true);
      result.data!.forEach(template => {
        expect(template.category).toBe('humanoid');
        expect(template.challengeRating).toBeLessThanOrEqual(1);
        expect(template.name.toLowerCase()).toContain('guard');
      });
    });

    it('returns empty array when no templates match filters', async () => {
      const result = await NPCTemplateService.getTemplates({
        category: 'nonexistent',
        search: 'impossiblename'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getTemplateById', () => {
    it('returns specific template by ID', async () => {
      // First get available templates
      const templatesResult = await NPCTemplateService.getTemplates();
      const templateId = templatesResult.data![0].id;

      const result = await NPCTemplateService.getTemplateById(templateId);

      expect(result.success).toBe(true);
      expect(result.data!.id).toBe(templateId);
    });

    it('returns error for non-existent template ID', async () => {
      const result = await NPCTemplateService.getTemplateById('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toContain('Template not found');
    });

    it('validates template ID format', async () => {
      const result = await NPCTemplateService.getTemplateById('');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('Template ID is required');
    });
  });

  describe('getTemplatesByCategory', () => {
    it('returns templates grouped by category', async () => {
      const result = await NPCTemplateService.getTemplatesByCategory();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('humanoid');
      expect(result.data).toHaveProperty('beast');
      expect(result.data).toHaveProperty('undead');

      // Check structure
      Object.values(result.data!).forEach(categoryTemplates => {
        expect(categoryTemplates).toBeInstanceOf(Array);
        categoryTemplates.forEach(template => {
          expect(template).toHaveProperty('id');
          expect(template).toHaveProperty('name');
          expect(template).toHaveProperty('challengeRating');
        });
      });
    });

    it('includes only categories with templates', async () => {
      const result = await NPCTemplateService.getTemplatesByCategory();

      expect(result.success).toBe(true);
      Object.values(result.data!).forEach(categoryTemplates => {
        expect(categoryTemplates.length).toBeGreaterThan(0);
      });
    });
  });

  describe('createCustomTemplate', () => {
    const validTemplate: Omit<NPCTemplate, 'id'> = {
      name: 'Custom Guard',
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
        hitPoints: { maximum: 12, current: 12 },
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
      equipment: [
        { name: 'Chain mail', type: 'armor' },
        { name: 'Shield', type: 'armor' },
        { name: 'Longsword', type: 'weapon' }
      ],
      spells: [],
      actions: [],
      behavior: {
        personality: 'Disciplined and loyal',
        motivations: 'Protect the town',
        tactics: 'Forms shield wall with allies'
      },
      isSystem: false
    };

    it('creates new custom template', async () => {
      const result = await NPCTemplateService.createCustomTemplate(validTemplate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data!.name).toBe(validTemplate.name);
      expect(result.data!.category).toBe(validTemplate.category);
      expect(result.data!.challengeRating).toBe(validTemplate.challengeRating);
    });

    it('validates required fields', async () => {
      const invalidTemplate = { ...validTemplate, name: '' };
      const result = await NPCTemplateService.createCustomTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('name is required');
    });

    it('validates challenge rating range', async () => {
      const invalidTemplate = { ...validTemplate, challengeRating: 35 };
      const result = await NPCTemplateService.createCustomTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('Number must be less than or equal to 30');
    });

    it('validates ability scores range', async () => {
      const invalidTemplate = {
        ...validTemplate,
        stats: {
          ...validTemplate.stats,
          abilityScores: {
            ...validTemplate.stats.abilityScores,
            strength: 35
          }
        }
      };
      const result = await NPCTemplateService.createCustomTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('Number must be less than or equal to 30');
    });

    it('validates hit points are positive', async () => {
      const invalidTemplate = {
        ...validTemplate,
        stats: {
          ...validTemplate.stats,
          hitPoints: { maximum: 0, current: 0 }
        }
      };
      const result = await NPCTemplateService.createCustomTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('Number must be greater than or equal to 1');
    });
  });

  describe('updateTemplate', () => {
    const templateUpdate = {
      name: 'Elite Guard',
      challengeRating: 2,
      stats: {
        abilityScores: {
          strength: 16,
          dexterity: 12,
          constitution: 15,
          intelligence: 10,
          wisdom: 11,
          charisma: 10
        },
        hitPoints: { maximum: 18, current: 18 },
        armorClass: 17,
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
      }
    };

    it('updates existing template', async () => {
      // First create a template
      const createResult = await NPCTemplateService.createCustomTemplate({
        name: 'Test Guard',
        category: 'humanoid',
        challengeRating: 1,
        size: 'medium',
        stats: {
          abilityScores: { strength: 15, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 11, charisma: 10 },
          hitPoints: { maximum: 12, current: 12 },
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
        isSystem: false
      });

      const templateId = createResult.data!.id;
      const result = await NPCTemplateService.updateTemplate(templateId, templateUpdate);

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe(templateUpdate.name);
      expect(result.data!.challengeRating).toBe(templateUpdate.challengeRating);
    });

    it('returns error for non-existent template', async () => {
      const result = await NPCTemplateService.updateTemplate('nonexistent-id', templateUpdate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toContain('Template not found');
    });

    it('validates update data', async () => {
      // First create a custom template to update
      const createResult = await NPCTemplateService.createCustomTemplate({
        name: 'Update Test',
        category: 'humanoid',
        challengeRating: 1,
        size: 'medium',
        stats: {
          abilityScores: { strength: 15, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 11, charisma: 10 },
          hitPoints: { maximum: 12, current: 12 },
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
        isSystem: false
      });

      const templateId = createResult.data!.id;
      const invalidUpdate = { challengeRating: -1 };
      const result = await NPCTemplateService.updateTemplate(templateId, invalidUpdate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('deleteTemplate', () => {
    it('deletes custom template', async () => {
      // First create a template
      const createResult = await NPCTemplateService.createCustomTemplate({
        name: 'Delete Test',
        category: 'humanoid',
        challengeRating: 1,
        size: 'medium',
        stats: {
          abilityScores: { strength: 15, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 11, charisma: 10 },
          hitPoints: { maximum: 12, current: 12 },
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
        isSystem: false
      });

      const templateId = createResult.data!.id;
      const result = await NPCTemplateService.deleteTemplate(templateId);

      expect(result.success).toBe(true);

      // Verify template is deleted
      const getResult = await NPCTemplateService.getTemplateById(templateId);
      expect(getResult.success).toBe(false);
      expect(getResult.error?.code).toBe('NOT_FOUND');
    });

    it('returns error for non-existent template', async () => {
      const result = await NPCTemplateService.deleteTemplate('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toContain('Template not found');
    });

    it('prevents deletion of system templates', async () => {
      // Try to delete a system template (should have specific IDs)
      const result = await NPCTemplateService.deleteTemplate('system-guard-basic');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FORBIDDEN');
      expect(result.error?.message).toContain('Cannot delete system template');
    });
  });

  describe('importTemplate', () => {
    const validImportData = {
      name: 'Imported NPC',
      type: 'npc',
      challengeRating: 2,
      abilityScores: {
        strength: 14,
        dexterity: 12,
        constitution: 13,
        intelligence: 10,
        wisdom: 11,
        charisma: 9
      },
      hitPoints: { maximum: 15, current: 15 },
      armorClass: 15,
      equipment: ['Studded leather', 'Shortsword'],
      spells: []
    };

    it('imports template from external data', async () => {
      const result = await NPCTemplateService.importTemplate(validImportData, 'json');

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe(validImportData.name);
      expect(result.data!.challengeRating).toBe(validImportData.challengeRating);
    });

    it('validates import data format', async () => {
      const invalidData = { name: 'Invalid', missing: 'challengeRating' };
      const result = await NPCTemplateService.importTemplate(invalidData, 'json');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('IMPORT_ERROR');
      expect(result.error?.message).toContain('Failed to import template');
    });

    it('handles different import formats', async () => {
      const ddbData = {
        name: 'D&D Beyond NPC',
        cr: '1/2',
        stats: {
          str: 13,
          dex: 12,
          con: 12,
          int: 10,
          wis: 11,
          cha: 10
        },
        hp: 11,
        ac: 16
      };

      const result = await NPCTemplateService.importTemplate(ddbData, 'dndbeyond');

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe(ddbData.name);
      expect(result.data!.challengeRating).toBe(0.5);
    });

    it('returns error for unsupported format', async () => {
      const result = await NPCTemplateService.importTemplate(validImportData, 'unsupported' as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.error?.message).toContain('Unsupported import format');
    });
  });

  describe('applyVariant', () => {
    it('applies elite variant modifier', async () => {
      const baseTemplate = {
        name: 'Guard',
        challengeRating: 0.25 as any,
        stats: {
          abilityScores: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
          hitPoints: { maximum: 8, current: 8 },
          armorClass: 16,
          speed: 30,
        }
      };

      const result = await NPCTemplateService.applyVariant(baseTemplate, 'elite');

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe('Elite Guard');
      expect(result.data!.challengeRating).toBeGreaterThan(baseTemplate.challengeRating);
      expect(result.data!.stats.hitPoints.maximum).toBeGreaterThan(baseTemplate.stats.hitPoints.maximum);
    });

    it('applies weak variant modifier', async () => {
      const baseTemplate = {
        name: 'Orc',
        challengeRating: 2 as any,
        stats: {
          abilityScores: { strength: 16, dexterity: 12, constitution: 16, intelligence: 7, wisdom: 11, charisma: 10 },
          hitPoints: { maximum: 20, current: 20 },
          armorClass: 13,
          speed: 30,
        }
      };

      const result = await NPCTemplateService.applyVariant(baseTemplate, 'weak');

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe('Weak Orc');
      expect(result.data!.challengeRating).toBeLessThan(baseTemplate.challengeRating);
      expect(result.data!.stats.hitPoints.maximum).toBeLessThan(baseTemplate.stats.hitPoints.maximum);
    });

    it('returns error for invalid variant type', async () => {
      const baseTemplate = {
        name: 'Guard',
        challengeRating: 0.5,
        stats: {
          abilityScores: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
          hitPoints: { maximum: 11, current: 11 },
          armorClass: 16,
          speed: 30,
        }
      };

      const result = await NPCTemplateService.applyVariant(baseTemplate, 'invalid' as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('Invalid variant type');
    });
  });
});