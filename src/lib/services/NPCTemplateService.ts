import { ServiceResult } from './CharacterServiceErrors';
import {
  NPCTemplate,
  NPCTemplateSchema,
  TemplateFilter,
  VariantType,
  ImportFormat,
  CreatureType,
} from '@/types/npc';
import { SYSTEM_TEMPLATES } from './NPCTemplateData';
import { NPCTemplateFilters } from './NPCTemplateFilters';
import { NPCTemplateVariants } from './NPCTemplateVariants';
import { NPCTemplateImporter } from './NPCTemplateImporter';
import { ServiceHelpers } from './ServiceHelpers';

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
      const validationResult = this.validateTemplateData(templateData);
      if (!validationResult.success) {
        return validationResult;
      }

      const newTemplate = this.buildNewTemplate(validationResult.data);
      customTemplates.push(newTemplate);

      return { success: true, data: newTemplate };
    } catch (error) {
      return ServiceHelpers.createErrorResult('INTERNAL_ERROR', 'Failed to create template', error);
    }
  }

  private static validateTemplateData(templateData: Omit<NPCTemplate, 'id'>): ServiceResult<any> {
    const validationResult = NPCTemplateSchema.omit({ id: true }).safeParse(templateData);

    if (!validationResult.success) {
      return ServiceHelpers.createValidationErrorResult(validationResult.error.errors);
    }

    return { success: true, data: validationResult.data };
  }

  private static buildNewTemplate(data: any): NPCTemplate {
    return {
      ...data,
      id: `custom-${nextCustomId++}`,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(id: string, updateData: Partial<Omit<NPCTemplate, 'id' | 'isSystem'>>): Promise<ServiceResult<NPCTemplate>> {
    try {
      const findResult = this.findAndValidateTemplate(id);
      if (!findResult.success) {
        return findResult;
      }

      const validationResult = this.validateUpdateData(updateData);
      if (!validationResult.success) {
        return validationResult;
      }

      const updatedTemplate = this.performTemplateUpdate(findResult.data.templateIndex, validationResult.data);
      return { success: true, data: updatedTemplate };
    } catch (error) {
      return ServiceHelpers.createErrorResult('INTERNAL_ERROR', 'Failed to update template', error);
    }
  }

  private static findAndValidateTemplate(id: string): ServiceResult<{ templateIndex: number }> {
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

    if (customTemplates[templateIndex].isSystem) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot update system template',
        },
      };
    }

    return { success: true, data: { templateIndex } };
  }

  private static validateUpdateData(updateData: Partial<Omit<NPCTemplate, 'id' | 'isSystem'>>): ServiceResult<any> {
    const partialSchema = NPCTemplateSchema.omit({ id: true, isSystem: true }).partial();
    const validationResult = partialSchema.safeParse(updateData);

    if (!validationResult.success) {
      return ServiceHelpers.createValidationErrorResult(validationResult.error.errors);
    }

    return { success: true, data: validationResult.data };
  }

  private static performTemplateUpdate(templateIndex: number, data: any): NPCTemplate {
    const updatedTemplate = {
      ...customTemplates[templateIndex],
      ...data,
      updatedAt: new Date(),
    };

    customTemplates[templateIndex] = updatedTemplate;
    return updatedTemplate;
  }

  /**
   * Delete a custom template
   */
  static async deleteTemplate(id: string): Promise<ServiceResult<void>> {
    try {
      const deleteResult = this.validateDeletion(id);
      if (!deleteResult.success) {
        return deleteResult;
      }

      customTemplates.splice(deleteResult.data.templateIndex, 1);
      return { success: true, data: undefined };
    } catch (error) {
      return ServiceHelpers.createErrorResult('INTERNAL_ERROR', 'Failed to delete template', error);
    }
  }

  private static validateDeletion(id: string): ServiceResult<{ templateIndex: number }> {
    const templateIndex = customTemplates.findIndex(t => t.id === id);

    if (templateIndex === -1) {
      return this.handleMissingTemplate(id);
    }

    return { success: true, data: { templateIndex } };
  }

  private static handleMissingTemplate(id: string): ServiceResult<any> {
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

  /**
   * Import template from external data
   */
  static async importTemplate(data: any, format: ImportFormat): Promise<ServiceResult<NPCTemplate>> {
    try {
      const templateData = NPCTemplateImporter.parseImportData(data, format);
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
    return NPCTemplateVariants.applyVariant(baseTemplate, variantType);
  }

}