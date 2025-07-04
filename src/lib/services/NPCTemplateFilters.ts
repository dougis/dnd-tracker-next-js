/**
 * NPC Template Filtering Logic
 *
 * Extracted filtering logic from NPCTemplateService to reduce complexity
 */

import { NPCTemplate, TemplateFilter } from '@/types/npc';

export class NPCTemplateFilters {

  /**
   * Apply category filter
   */
  static applyCategory(templates: NPCTemplate[], category: string): NPCTemplate[] {
    return templates.filter(t => t.category === category);
  }

  /**
   * Apply minimum challenge rating filter
   */
  static applyMinCR(templates: NPCTemplate[], minCR: number): NPCTemplate[] {
    return templates.filter(t => t.challengeRating >= minCR);
  }

  /**
   * Apply maximum challenge rating filter
   */
  static applyMaxCR(templates: NPCTemplate[], maxCR: number): NPCTemplate[] {
    return templates.filter(t => t.challengeRating <= maxCR);
  }

  /**
   * Apply search filter
   */
  static applySearch(templates: NPCTemplate[], search: string): NPCTemplate[] {
    const searchLower = search.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Apply size filter
   */
  static applySize(templates: NPCTemplate[], size: string): NPCTemplate[] {
    return templates.filter(t => t.size === size);
  }

  /**
   * Apply system/custom filter
   */
  static applySystemFilter(templates: NPCTemplate[], isSystem: boolean): NPCTemplate[] {
    return templates.filter(t => t.isSystem === isSystem);
  }

  /**
   * Apply all filters in a single pass
   */
  static applyAllFilters(templates: NPCTemplate[], filters: TemplateFilter): NPCTemplate[] {
    return templates.filter(template => {
      // Category filter
      if (filters.category && template.category !== filters.category) return false;
      
      // Challenge rating filters
      if (filters.minCR !== undefined && template.challengeRating < filters.minCR) return false;
      if (filters.maxCR !== undefined && template.challengeRating > filters.maxCR) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!template.name.toLowerCase().includes(searchLower) && 
            !template.category.toLowerCase().includes(searchLower)) return false;
      }
      
      // Size filter
      if (filters.size && template.size !== filters.size) return false;
      
      // System filter
      if (filters.isSystem !== undefined && template.isSystem !== filters.isSystem) return false;
      
      return true;
    });
  }

  /**
   * Sort templates by challenge rating and name
   */
  static sortTemplates(templates: NPCTemplate[]): NPCTemplate[] {
    return templates.sort((a, b) => {
      if (a.challengeRating !== b.challengeRating) {
        return a.challengeRating - b.challengeRating;
      }
      return a.name.localeCompare(b.name);
    });
  }
}