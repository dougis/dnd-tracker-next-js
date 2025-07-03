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
   * Apply all filters in sequence
   */
  static applyAllFilters(templates: NPCTemplate[], filters: TemplateFilter): NPCTemplate[] {
    let filtered = [...templates];

    if (filters.category) {
      filtered = this.applyCategory(filtered, filters.category);
    }

    if (filters.minCR !== undefined) {
      filtered = this.applyMinCR(filtered, filters.minCR);
    }

    if (filters.maxCR !== undefined) {
      filtered = this.applyMaxCR(filtered, filters.maxCR);
    }

    if (filters.search) {
      filtered = this.applySearch(filtered, filters.search);
    }

    if (filters.size) {
      filtered = this.applySize(filtered, filters.size);
    }

    if (filters.isSystem !== undefined) {
      filtered = this.applySystemFilter(filtered, filters.isSystem);
    }

    return filtered;
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