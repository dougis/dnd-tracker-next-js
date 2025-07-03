import { ServiceResult } from './CharacterServiceErrors';
import {
  NPCTemplate,
  NPCTemplateSchema,
  TemplateFilter,
  VariantType,
  ImportFormat,
  ChallengeRating,
  CreatureType,
  calculateProficiencyBonus,
  parseChallengeRating,
} from '@/types/npc';
import { SYSTEM_TEMPLATES } from './NPCTemplateData';
import { NPCTemplateFilters } from './NPCTemplateFilters';

// In-memory store for custom templates (in production, this would be a database)
const customTemplates: NPCTemplate[] = [];
let nextCustomId = 1;

export class NPCTemplateService {

  /**
   * Get all available NPC templates with optional filtering
   */
  static async getTemplates(filters?: TemplateFilter): Promise<ServiceResult<NPCTemplate[]>> {
    try {
      let templates = [...SYSTEM_TEMPLATES, ...customTemplates];

      // Apply filters using extracted filter logic
      if (filters) {
        templates = NPCTemplateFilters.applyAllFilters(templates, filters);
      }

      // Sort templates
      templates = NPCTemplateFilters.sortTemplates(templates);

      return { success: true, data: templates };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch templates',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Get a specific template by ID
   */
  static async getTemplateById(id: string): Promise<ServiceResult<NPCTemplate>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Template ID is required',
          },
        };
      }

      const template = [...SYSTEM_TEMPLATES, ...customTemplates].find(t => t.id === id);

      if (!template) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
          },
        };
      }

      return { success: true, data: template };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch template',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Get templates grouped by category
   */
  static async getTemplatesByCategory(): Promise<ServiceResult<Record<CreatureType, NPCTemplate[]>>> {
    try {
      const templatesResult = await this.getTemplates();
      if (!templatesResult.success) {
        return templatesResult as ServiceResult<Record<CreatureType, NPCTemplate[]>>;
      }

      const grouped: Record<CreatureType, NPCTemplate[]> = {} as Record<CreatureType, NPCTemplate[]>;

      templatesResult.data!.forEach(template => {
        if (!grouped[template.category]) {
          grouped[template.category] = [];
        }
        grouped[template.category].push(template);
      });

      // Only return categories that have templates
      const filteredGrouped = Object.fromEntries(
        Object.entries(grouped).filter(([_, templates]) => templates.length > 0)
      ) as Record<CreatureType, NPCTemplate[]>;

      return { success: true, data: filteredGrouped };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to group templates by category',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Create a new custom template
   */
  static async createCustomTemplate(templateData: Omit<NPCTemplate, 'id'>): Promise<ServiceResult<NPCTemplate>> {
    try {
      // Validate the template data
      const validationResult = NPCTemplateSchema.omit({ id: true }).safeParse(templateData);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMessage,
          },
        };
      }

      // Create new template with generated ID
      const newTemplate: NPCTemplate = {
        ...validationResult.data,
        id: `custom-${nextCustomId++}`,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      customTemplates.push(newTemplate);

      return { success: true, data: newTemplate };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create template',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(id: string, updateData: Partial<Omit<NPCTemplate, 'id' | 'isSystem'>>): Promise<ServiceResult<NPCTemplate>> {
    try {
      const templateIndex = customTemplates.findIndex(t => t.id === id);

      if (templateIndex === -1) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
          },
        };
      }

      // Prevent updating system templates
      if (customTemplates[templateIndex].isSystem) {
        return {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot update system template',
          },
        };
      }

      // Validate update data
      const partialSchema = NPCTemplateSchema.omit({ id: true, isSystem: true }).partial();
      const validationResult = partialSchema.safeParse(updateData);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMessage,
          },
        };
      }

      // Update template
      const updatedTemplate = {
        ...customTemplates[templateIndex],
        ...validationResult.data,
        updatedAt: new Date(),
      };

      customTemplates[templateIndex] = updatedTemplate;

      return { success: true, data: updatedTemplate };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update template',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Delete a custom template
   */
  static async deleteTemplate(id: string): Promise<ServiceResult<void>> {
    try {
      const templateIndex = customTemplates.findIndex(t => t.id === id);

      if (templateIndex === -1) {
        // Check if it's a system template
        const systemTemplate = SYSTEM_TEMPLATES.find(t => t.id === id);
        if (systemTemplate) {
          return {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Cannot delete system template',
            },
          };
        }

        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
          },
        };
      }

      customTemplates.splice(templateIndex, 1);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete template',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Import template from external data
   */
  static async importTemplate(data: any, format: ImportFormat): Promise<ServiceResult<NPCTemplate>> {
    try {
      let templateData: Omit<NPCTemplate, 'id'>;

      switch (format) {
        case 'json':
          templateData = this.parseJSONImport(data);
          break;
        case 'dndbeyond':
          templateData = this.parseDnDBeyondImport(data);
          break;
        case 'roll20':
          templateData = this.parseRoll20Import(data);
          break;
        case 'custom':
          templateData = this.parseCustomImport(data);
          break;
        default:
          return {
            success: false,
            error: {
              code: 'UNSUPPORTED_FORMAT',
              message: 'Unsupported import format',
            },
          };
      }

      // Create the template using the parsed data
      return await this.createCustomTemplate(templateData);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'IMPORT_ERROR',
          message: 'Failed to import template',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  /**
   * Apply variant modifiers to a base template
   */
  static async applyVariant(baseTemplate: Partial<NPCTemplate>, variantType: VariantType): Promise<ServiceResult<NPCTemplate>> {
    try {
      if (!['elite', 'weak', 'champion', 'minion'].includes(variantType)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid variant type',
          },
        };
      }

      const variant = { ...baseTemplate };

      switch (variantType) {
        case 'elite':
          variant.name = `Elite ${baseTemplate.name}`;
          variant.challengeRating = this.adjustChallengeRating(baseTemplate.challengeRating!, 1.5);
          if (variant.stats) {
            variant.stats.hitPoints.maximum = Math.floor(variant.stats.hitPoints.maximum * 1.5);
            variant.stats.hitPoints.current = variant.stats.hitPoints.maximum;
            variant.stats.abilityScores = {
              ...variant.stats.abilityScores,
              strength: Math.min(30, variant.stats.abilityScores.strength + 2),
              dexterity: Math.min(30, variant.stats.abilityScores.dexterity + 2),
              constitution: Math.min(30, variant.stats.abilityScores.constitution + 2),
            };
          }
          break;

        case 'weak':
          variant.name = `Weak ${baseTemplate.name}`;
          variant.challengeRating = this.adjustChallengeRating(baseTemplate.challengeRating!, 0.7);
          if (variant.stats) {
            variant.stats.hitPoints.maximum = Math.max(1, Math.floor(variant.stats.hitPoints.maximum * 0.6));
            variant.stats.hitPoints.current = variant.stats.hitPoints.maximum;
            variant.stats.abilityScores = {
              ...variant.stats.abilityScores,
              strength: Math.max(1, variant.stats.abilityScores.strength - 2),
              dexterity: Math.max(1, variant.stats.abilityScores.dexterity - 2),
              constitution: Math.max(1, variant.stats.abilityScores.constitution - 2),
            };
          }
          break;

        case 'champion':
          variant.name = `${baseTemplate.name} Champion`;
          variant.challengeRating = this.adjustChallengeRating(baseTemplate.challengeRating!, 2);
          if (variant.stats) {
            variant.stats.hitPoints.maximum = Math.floor(variant.stats.hitPoints.maximum * 2);
            variant.stats.hitPoints.current = variant.stats.hitPoints.maximum;
            variant.stats.armorClass += 2;
            // Add legendary actions or special abilities
          }
          break;

        case 'minion':
          variant.name = `${baseTemplate.name} Minion`;
          variant.challengeRating = this.adjustChallengeRating(baseTemplate.challengeRating!, 0.5);
          if (variant.stats) {
            variant.stats.hitPoints.maximum = 1;
            variant.stats.hitPoints.current = 1;
          }
          break;
      }

      return { success: true, data: variant as NPCTemplate };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to apply variant',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  // Private helper methods
  private static parseJSONImport(data: any): Omit<NPCTemplate, 'id'> {
    // Basic validation for JSON import
    if (!data.name) throw new Error('name is required');
    if (data.challengeRating === undefined && data.challengeRating !== 0) throw new Error('challengeRating is required');

    return {
      name: data.name,
      category: data.creatureType || data.category || 'humanoid',
      challengeRating: data.challengeRating,
      size: data.size || 'medium',
      stats: {
        abilityScores: data.abilityScores || {
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10,
        },
        hitPoints: data.hitPoints ? { ...data.hitPoints, temporary: data.hitPoints.temporary || 0 } : { maximum: 1, current: 1, temporary: 0 },
        armorClass: data.armorClass || 10,
        speed: data.speed || 30,
        proficiencyBonus: calculateProficiencyBonus(data.challengeRating),
        savingThrows: data.savingThrows || {},
        skills: data.skills || {},
        damageVulnerabilities: data.damageVulnerabilities || [],
        damageResistances: data.damageResistances || [],
        damageImmunities: data.damageImmunities || [],
        conditionImmunities: data.conditionImmunities || [],
        senses: data.senses || [],
        languages: data.languages || [],
      },
      equipment: (data.equipment || []).map((item: any) =>
        typeof item === 'string' ? { name: item } : item
      ),
      spells: data.spells || [],
      actions: data.actions || [],
      behavior: data.behavior,
      isSystem: false,
    };
  }

  private static parseDnDBeyondImport(data: any): Omit<NPCTemplate, 'id'> {
    // Parse D&D Beyond format
    const challengeRating = typeof data.cr === 'string' ? parseChallengeRating(data.cr) : data.cr;

    return {
      name: data.name,
      category: 'humanoid', // Default, should be parsed from data
      challengeRating,
      size: 'medium',
      stats: {
        abilityScores: {
          strength: data.stats?.str || 10,
          dexterity: data.stats?.dex || 10,
          constitution: data.stats?.con || 10,
          intelligence: data.stats?.int || 10,
          wisdom: data.stats?.wis || 10,
          charisma: data.stats?.cha || 10,
        },
        hitPoints: { maximum: data.hp || 1, current: data.hp || 1, temporary: 0 },
        armorClass: data.ac || 10,
        speed: data.speed || 30,
        proficiencyBonus: calculateProficiencyBonus(challengeRating),
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
    };
  }

  private static parseRoll20Import(_data: any): Omit<NPCTemplate, 'id'> {
    // Parse Roll20 format - placeholder implementation
    throw new Error('Roll20 import not yet implemented');
  }

  private static parseCustomImport(_data: any): Omit<NPCTemplate, 'id'> {
    // Parse custom format - placeholder implementation
    throw new Error('Custom import not yet implemented');
  }

  private static adjustChallengeRating(baseCR: ChallengeRating, multiplier: number): ChallengeRating {
    if (baseCR === 0) return multiplier > 1 ? 0.125 : 0;

    const adjusted = baseCR * multiplier;

    // Handle fractional CRs
    if (adjusted <= 0) return 0;
    if (adjusted <= 0.125) return 0.125;
    if (adjusted <= 0.25) return 0.25;
    if (adjusted < 1) return 0.5;

    // Handle integer CRs
    const rounded = Math.round(adjusted);
    return Math.min(30, Math.max(1, rounded)) as ChallengeRating;
  }
}